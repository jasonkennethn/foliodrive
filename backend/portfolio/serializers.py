from rest_framework import serializers
from .models import Profile, ThemeSettings, Section, ContentBlock


class ContentBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentBlock
        fields = [
            'id', 'section', 'block_type', 'order',
            'title', 'description', 'image', 'link',
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
    class Meta:
        model = Profile
        fields = ['id', 'name', 'custom_intro', 'role', 'location', 'tagline', 'show_profile_pic', 'profile_pic']


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

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    email = serializers.EmailField(required=True)
    allocated_password = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'allocated_password', 'is_superuser', 'is_staff', 'date_joined']
        read_only_fields = ['id', 'is_superuser', 'is_staff', 'date_joined']

    def get_allocated_password(self, obj):
        try:
            return obj.profile.allocated_password
        except Exception:
            return ""

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        # Check if email exists
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
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

        return user


class ContactRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactRequest
        fields = ['id', 'name', 'email', 'description', 'phone', 'created_at']

