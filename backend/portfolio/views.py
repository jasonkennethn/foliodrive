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


import urllib.request
import urllib.error
import json
from django.conf import settings

class AIWriterView(views.APIView):
    """POST /api/ai/assist/ — calls Gemini API to assist the user with resume writing and ATS optimization."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        field_type = request.data.get('field_type', '')
        current_text = request.data.get('current_text', '').strip()
        role = request.data.get('role', 'Professional').strip()
        
        if not field_type or not current_text:
            return Response(
                {"error": "Both 'field_type' and 'current_text' are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        api_key = getattr(settings, 'GEMINI_API_KEY', '')
        if not api_key or api_key == 'your_gemini_api_key_here':
            return Response(
                {"error": "Gemini API key is not configured. Please add it to the backend .env file."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Formulate prompt based on field_type
        if field_type == 'tagline':
            prompt = f"You are a professional resume writer. Write a single sentence, high-impact professional tagline for a {role} profile based on this draft: '{current_text}'. Make it punchy, corporate-ready, and modern."
        elif field_type == 'bio':
            prompt = f"Write a professional, ATS-friendly executive summary bio (about me paragraph) for a {role} based on these notes: '{current_text}'. Write a cohesive, strong paragraph (3-4 sentences) that highlights expertise and value."
        elif field_type == 'description':
            prompt = f"Improve this resume or project description to make it highly professional and sound impactful. Role/Context: {role}. Current draft: '{current_text}'. Return a polished, professional description."
        elif field_type == 'bullets':
            prompt = f"Convert the following description into 2 to 4 high-impact resume bullet points. Role: {role}. Start each bullet point with strong action verbs (e.g. Optimized, Developed, Authored, Spearheaded). Input text: '{current_text}'."
        elif field_type == 'ats_optimize':
            prompt = f"Optimize the following resume section to make it highly ATS-friendly. Add standard keywords for a {role} role, improve readability, and polish the structure. Input text: '{current_text}'."
        else:
            prompt = f"Improve and rewrite the following professional text: '{current_text}' for a {role} profile."

        # Call Gemini API with self-healing fallback models
        models_to_try = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-1.5-flash-latest']
        suggested_text = None
        last_error = ""

        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            headers = {'Content-Type': 'application/json'}
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
            req_data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(url, data=req_data, headers=headers, method='POST')
            
            try:
                with urllib.request.urlopen(req, timeout=6) as response:
                    res_data = response.read().decode('utf-8')
                    res_json = json.loads(res_data)
                    suggested_text = res_json['candidates'][0]['content']['parts'][0]['text'].strip()
                    break  # Success, exit the fallback loop!
            except urllib.error.HTTPError as e:
                try:
                    err_content = e.read().decode('utf-8')
                    err_json = json.loads(err_content)
                    err_msg = err_json.get('error', {}).get('message', '')
                except Exception:
                    err_msg = str(e)
                last_error = f"{model_name} failed: {e.code} - {err_msg}"
                # If it's a transient server issue, try the next model
                if e.code in [404, 429, 500, 503]:
                    continue
                else:
                    # If it's a fatal validation/auth issue, return immediately
                    return Response(
                        {"error": f"Gemini API returned an error: {e.code} - {err_msg}"},
                        status=status.HTTP_502_BAD_GATEWAY
                    )
            except Exception as e:
                last_error = f"{model_name} request failed: {str(e)}"
                continue

        if not suggested_text:
            return Response(
                {"error": f"Gemini API was temporarily unavailable. Last error: {last_error}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Strip markdown syntax (like backticks or code blocks) if Gemini wraps it
        if suggested_text.startswith("```"):
            lines = suggested_text.split('\n')
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            suggested_text = '\n'.join(lines).strip()

        # Clean raw markdown formatting (such as double asterisks representing bold text)
        suggested_text = suggested_text.replace("**", "").replace("__", "")
        # Clean quotes
        suggested_text = suggested_text.strip().strip('"\'')
            
        return Response({"suggested_text": suggested_text})

