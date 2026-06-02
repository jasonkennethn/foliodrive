from django.db import models
from django.contrib.auth import get_user_model

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
    profile_pic = models.ImageField(upload_to='profile/', blank=True, null=True)

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
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default='dark')
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
