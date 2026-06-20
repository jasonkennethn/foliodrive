from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Profile(models.Model):
    """Stores the portfolio owner's profile information."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=True, blank=True)
    allocated_password = models.CharField(max_length=128, blank=True, default='')
    name = models.CharField(max_length=200, default='Your Name')
    custom_intro = models.CharField(max_length=200, default="Hello, I'm")
    bio = models.TextField(blank=True, default='')
    role = models.CharField(max_length=200, default="Full Stack Developer")
    location = models.CharField(max_length=200, default="New York, USA")
    tagline = models.CharField(max_length=500, blank=True, default='')
    show_profile_pic = models.BooleanField(default=True)
    show_ats_button = models.BooleanField(default=True)
    profile_pic = models.ImageField(upload_to='profile/', blank=True, null=True)
    resume_file = models.FileField(upload_to='profiles/resumes/', blank=True, null=True)

    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profile'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Enforce singleton per user
        if not self.pk and self.user and Profile.objects.filter(user=self.user).exists():
            existing = Profile.objects.filter(user=self.user).first()
            self.pk = existing.pk
        super().save(*args, **kwargs)


class ThemeSettings(models.Model):
    """Stores theme preferences for the portfolio."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='theme_settings', null=True, blank=True)
    MODE_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('system', 'System'),
    ]
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default='system')
    accent_color = models.CharField(max_length=7, default='#6366f1')  # Hex color
    font_family = models.CharField(max_length=100, default='Inter')

    class Meta:
        verbose_name = 'Theme Settings'
        verbose_name_plural = 'Theme Settings'

    def __str__(self):
        return f'Theme: {self.mode} / {self.accent_color}'

    def save(self, *args, **kwargs):
        if not self.pk and self.user and ThemeSettings.objects.filter(user=self.user).exists():
            existing = ThemeSettings.objects.filter(user=self.user).first()
            self.pk = existing.pk
        super().save(*args, **kwargs)


class Section(models.Model):
    """A named section in the portfolio (e.g., About, Projects, Experience)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sections', null=True, blank=True)
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Section'
        verbose_name_plural = 'Sections'

    def __str__(self):
        return self.title


class ContentBlock(models.Model):
    """A block of content inside a section. Supports multiple types."""
    BLOCK_TYPES = [
        ('card', 'Card'),
        ('paragraph', 'Paragraph'),
        ('skills', 'Skills'),
        ('timeline', 'Timeline'),
        ('gallery', 'Gallery'),
        ('embed', 'Embed'),
    ]

    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name='blocks'
    )
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPES)
    order = models.PositiveIntegerField(default=0)

    # --- Card fields ---
    title = models.CharField(max_length=300, blank=True, default='')
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='blocks/', blank=True, null=True)
    file = models.FileField(upload_to='blocks/files/', blank=True, null=True)
    link = models.CharField(max_length=500, blank=True, default='')

    # --- Paragraph fields ---
    text = models.TextField(blank=True, default='')

    # --- Skills fields (comma-separated tags) ---
    tags = models.TextField(blank=True, default='', help_text='Comma-separated skill tags')

    # --- Timeline fields ---
    timeline_date = models.CharField(max_length=100, blank=True, default='')
    timeline_title = models.CharField(max_length=300, blank=True, default='')
    timeline_description = models.TextField(blank=True, default='')

    # --- Embed fields ---
    embed_url = models.URLField(blank=True, default='')

    class Meta:
        ordering = ['order']
        verbose_name = 'Content Block'
        verbose_name_plural = 'Content Blocks'

    def __str__(self):
        return f'{self.block_type}: {self.title or self.text[:50] or "Block"}'


class ContactRequest(models.Model):
    """Contact inquiries submitted via the advertising landing page."""
    name = models.CharField(max_length=200)
    email = models.EmailField()
    description = models.TextField()
    phone = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Request'
        verbose_name_plural = 'Contact Requests'

    def __str__(self):
        return f"Contact Request from {self.name} ({self.email})"


class UserAccess(models.Model):
    """Controls whether a user's portfolio is accessible or blocked."""
    ACCESS_TYPE_CHOICES = [
        ('trial', 'Trial'),
        ('paid', 'Paid'),
        ('lifetime', 'Lifetime'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='access')
    is_active = models.BooleanField(default=True, help_text='Master switch for access')
    access_type = models.CharField(max_length=20, choices=ACCESS_TYPE_CHOICES, default='trial')
    expires_at = models.DateTimeField(null=True, blank=True, help_text='When access expires (null = no expiry set)')
    blocked_by_admin = models.BooleanField(default=False, help_text='Admin can manually block access')
    block_reason = models.CharField(max_length=500, blank=True, default='', help_text='Reason shown to user when blocked')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Access'
        verbose_name_plural = 'User Access'
        ordering = ['-created_at']

    def __str__(self):
        status = 'Active' if self.is_access_valid() else 'Blocked'
        return f"{self.user.username} — {self.access_type} ({status})"

    def is_access_valid(self):
        """Check if the user's portfolio access is currently valid."""
        # Admin manual block takes highest priority
        if self.blocked_by_admin:
            return False

        # Master switch
        if not self.is_active:
            return False

        # Lifetime access never expires
        if self.access_type == 'lifetime':
            return True

        # Check expiry for trial/paid
        if self.expires_at and timezone.now() > self.expires_at:
            return False

        return True

    def get_block_reason(self):
        """Return a human-readable reason for why access is blocked."""
        if self.blocked_by_admin:
            return self.block_reason or 'Your portfolio access has been temporarily suspended by the administrator.'

        if not self.is_active:
            return 'Your portfolio access is currently disabled.'

        if self.expires_at and timezone.now() > self.expires_at:
            return 'Your portfolio access has expired. Please renew your subscription to restore access.'

        return ''
