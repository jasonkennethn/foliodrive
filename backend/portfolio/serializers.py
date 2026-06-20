from rest_framework import serializers
from .models import Profile, ThemeSettings, Section, ContentBlock, UserAccess


class ContentBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentBlock
        fields = [
            'id', 'section', 'block_type', 'order',
            'title', 'description', 'image', 'file', 'link',
            'text',
            'tags',
            'timeline_date', 'timeline_title', 'timeline_description',
            'embed_url',
        ]
        extra_kwargs = {
            'section': {'required': True},
        }


class SectionSerializer(serializers.ModelSerializer):
    blocks = ContentBlockSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'title', 'order', 'is_visible', 'blocks']


class SectionWriteSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating sections (no nested blocks)."""
    class Meta:
        model = Section
        fields = ['id', 'title', 'order', 'is_visible']


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'name', 'custom_intro', 'bio', 'role', 'location', 'tagline', 'show_profile_pic', 'show_ats_button', 'profile_pic', 'resume_file', 'email']

    def get_email(self, obj):
        return obj.user.email if obj.user else ""

    def to_internal_value(self, data):
        # Convert string representations of boolean fields to actual booleans (needed for multipart/form-data)
        data = data.copy() if hasattr(data, 'copy') else data
        for field in ['show_profile_pic', 'show_ats_button']:
            if field in data:
                val = data[field]
                if val in ['true', 'True', '1', True]:
                    data[field] = True
                elif val in ['false', 'False', '0', False]:
                    data[field] = False
        return super().to_internal_value(data)



class ThemeSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThemeSettings
        fields = ['id', 'mode', 'accent_color', 'font_family']


class PortfolioPublicSerializer(serializers.Serializer):
    """Read-only serializer that combines all portfolio data for the public page."""
    profile = ProfileSerializer()
    theme = ThemeSettingsSerializer()
    sections = SectionSerializer(many=True)


from django.contrib.auth import get_user_model
User = get_user_model()
from .models import ContactRequest

class UserAccessSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    is_valid = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = UserAccess
        fields = [
            'id', 'username', 'email', 'is_active', 'access_type',
            'expires_at', 'blocked_by_admin', 'block_reason',
            'is_valid', 'status_display', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'username', 'email', 'is_valid', 'status_display', 'created_at', 'updated_at']

    def get_is_valid(self, obj):
        return obj.is_access_valid()

    def get_status_display(self, obj):
        if obj.blocked_by_admin:
            return 'Blocked by Admin'
        if not obj.is_active:
            return 'Disabled'
        if obj.access_type == 'lifetime':
            return 'Lifetime'
        if obj.expires_at:
            from django.utils import timezone
            if timezone.now() > obj.expires_at:
                return 'Expired'
            return f'Active until {obj.expires_at.strftime("%b %d, %Y")}'
        return 'Active'


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    email = serializers.EmailField(required=True)
    allocated_password = serializers.SerializerMethodField()
    access_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'allocated_password', 'is_superuser', 'is_staff', 'date_joined', 'access_status']
        read_only_fields = ['id', 'is_superuser', 'is_staff', 'date_joined']

    def get_allocated_password(self, obj):
        try:
            return obj.profile.allocated_password
        except Exception:
            return ""

    def get_access_status(self, obj):
        try:
            access = obj.access
            return {
                'id': access.id,
                'is_active': access.is_active,
                'access_type': access.access_type,
                'expires_at': access.expires_at.isoformat() if access.expires_at else None,
                'blocked_by_admin': access.blocked_by_admin,
                'is_valid': access.is_access_valid(),
                'status_display': UserAccessSerializer().get_status_display(access),
            }
        except UserAccess.DoesNotExist:
            return None

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        # Check if email exists
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Username is required.")
        if any(c.isspace() for c in value):
            raise serializers.ValidationError("Username cannot contain spaces.")
        import re
        if not re.match(r'^[a-zA-Z0-9-]+$', value):
            raise serializers.ValidationError("Only letters, numbers, and - allowed for usernames.")
        
        # Reserved username check
        reserved_usernames = [
            'admin', 'payment', 'template', 'showcase', 'master-admin', 'root-admin',
            'api', 'static', 'media', 'login', 'logout', 'register', 'dashboard',
            'pricing', 'features', 'contact', 'mimi', 'help', 'support'
        ]
        if value.lower() in reserved_usernames:
            raise serializers.ValidationError("This username is reserved and cannot be used.")
            
        # Duplicate check (case-insensitive)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
            
        return value

    def create(self, validated_data):
        username = validated_data['username']
        email = validated_data['email']
        password = validated_data['password']
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        user.is_staff = True  # Make them master-admin staff
        user.save()

        # Create user profile and store raw password
        Profile.objects.create(
            user=user,
            name=username,
            allocated_password=password
        )
        
        # Create user default theme settings
        ThemeSettings.objects.create(
            user=user
        )

        # Create user access record (default: trial, active, 30 days expiry)
        from django.utils import timezone
        from datetime import timedelta
        UserAccess.objects.create(
            user=user,
            is_active=True,
            access_type='trial',
            expires_at=timezone.now() + timedelta(days=30),
        )

        return user


class ContactRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactRequest
        fields = ['id', 'name', 'email', 'description', 'phone', 'created_at']
