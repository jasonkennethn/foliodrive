from rest_framework import generics, status, views
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Profile, ThemeSettings, Section, ContentBlock, ContactRequest
from .serializers import (
    ProfileSerializer,
    ThemeSettingsSerializer,
    SectionSerializer,
    SectionWriteSerializer,
    ContentBlockSerializer,
    ContactRequestSerializer,
)


# ─── Public endpoint: full portfolio data ───────────────────────────────────

class PortfolioPublicView(views.APIView):
    """GET /api/portfolio/<username>/ — returns complete portfolio data for a specific user."""
    permission_classes = [AllowAny]

    def get(self, request, username):
        UserModel = get_user_model()
        user = get_object_or_404(UserModel, username__iexact=username)
        profile, _ = Profile.objects.get_or_create(user=user, defaults={'name': user.username})
        theme, _ = ThemeSettings.objects.get_or_create(user=user)
        sections = Section.objects.filter(user=user, is_visible=True).prefetch_related('blocks')

        return Response({
            'profile': ProfileSerializer(profile).data,
            'theme': ThemeSettingsSerializer(theme).data,
            'sections': SectionSerializer(sections, many=True, context={'request': request}).data,
        })


class PortfolioSelfView(views.APIView):
    """GET /api/portfolio/my/ — returns logged-in user's portfolio data (requires auth)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user, defaults={'name': user.username})
        theme, _ = ThemeSettings.objects.get_or_create(user=user)
        sections = Section.objects.filter(user=user).prefetch_related('blocks')

        return Response({
            'profile': ProfileSerializer(profile).data,
            'theme': ThemeSettingsSerializer(theme).data,
            'sections': SectionSerializer(sections, many=True, context={'request': request}).data,
        })


class ContactRequestCreateView(generics.CreateAPIView):
    """POST /api/contacts/ — submit a contact form entry (public)."""
    queryset = ContactRequest.objects.all()
    serializer_class = ContactRequestSerializer
    permission_classes = [AllowAny]


# ─── Profile CRUD ───────────────────────────────────────────────────────────

class ProfileView(views.APIView):
    """GET/PUT /api/profile/ — manage the user's profile."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user, defaults={'name': request.user.username})
        return Response(ProfileSerializer(profile, context={'request': request}).data)

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user, defaults={'name': request.user.username})
        serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ─── Theme CRUD ─────────────────────────────────────────────────────────────

class ThemeView(views.APIView):
    """GET/PUT /api/theme/ — manage user's theme settings."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        theme, _ = ThemeSettings.objects.get_or_create(user=request.user)
        return Response(ThemeSettingsSerializer(theme).data)

    def put(self, request):
        theme, _ = ThemeSettings.objects.get_or_create(user=request.user)
        serializer = ThemeSettingsSerializer(theme, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ─── Section CRUD ───────────────────────────────────────────────────────────

class SectionListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/sections/ — list or create sections for logged-in user."""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Section.objects.filter(user=self.request.user).prefetch_related('blocks')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SectionWriteSerializer
        return SectionSerializer

    def perform_create(self, serializer):
        max_order = Section.objects.filter(user=self.request.user).count()
        serializer.save(user=self.request.user, order=max_order)


class SectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/sections/<id>/ — manage a user's section."""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Section.objects.filter(user=self.request.user).prefetch_related('blocks')

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return SectionWriteSerializer
        return SectionSerializer


class SectionReorderView(views.APIView):
    """PATCH /api/sections/reorder/ — bulk reorder user's sections."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        order = request.data.get('order', [])
        owned_sections = Section.objects.filter(user=request.user, id__in=order)
        owned_ids = set(owned_sections.values_list('id', flat=True))
        
        for index, section_id in enumerate(order):
            if section_id in owned_ids:
                Section.objects.filter(pk=section_id).update(order=index)
        return Response({'status': 'reordered'})


# ─── Content Block CRUD ─────────────────────────────────────────────────────

class ContentBlockCreateView(generics.CreateAPIView):
    """POST /api/blocks/ — create a content block inside a user's section."""
    serializer_class = ContentBlockSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        section = serializer.validated_data['section']
        if section.user != self.request.user:
            raise PermissionDenied("You do not own this section.")
        max_order = section.blocks.count()
        serializer.save(order=max_order)


class ContentBlockDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/blocks/<id>/ — manage a user's content block."""
    serializer_class = ContentBlockSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return ContentBlock.objects.filter(section__user=self.request.user)


class BlockReorderView(views.APIView):
    """PATCH /api/blocks/reorder/ — bulk reorder blocks within a user's section."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        order = request.data.get('order', [])
        owned_blocks = ContentBlock.objects.filter(section__user=request.user, id__in=order)
        owned_ids = set(owned_blocks.values_list('id', flat=True))
        
        for index, block_id in enumerate(order):
            if block_id in owned_ids:
                ContentBlock.objects.filter(pk=block_id).update(order=index)
        return Response({'status': 'reordered'})


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import permissions
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_superuser'] = self.user.is_superuser
        data['is_staff'] = self.user.is_staff
        data['username'] = self.user.username
        data['email'] = self.user.email
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class IsSuperUser(permissions.BasePermission):
    """Allows access only to superusers."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

class UserAdminListView(generics.ListCreateAPIView):
    """GET/POST /api/admin/users/ — list or create master-admin users (superuser only)."""
    queryset = User.objects.filter(is_staff=True).order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]

class UserAdminDestroyView(generics.DestroyAPIView):
    """DELETE /api/admin/users/<id>/ — delete a master-admin user (superuser only)."""
    queryset = User.objects.filter(is_staff=True)
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Prevent superuser from deleting themselves
        if instance.id == request.user.id:
            return Response(
                {"error": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
