from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('portfolio/my/', views.PortfolioSelfView.as_view(), name='portfolio-self'),
    path('portfolio/<str:username>/', views.PortfolioPublicView.as_view(), name='portfolio-public'),
    path('contacts/', views.ContactRequestCreateView.as_view(), name='contact-create'),

    # Profile (authenticated)
    path('profile/', views.ProfileView.as_view(), name='profile'),

    # Theme (authenticated)
    path('theme/', views.ThemeView.as_view(), name='theme'),

    # Sections (authenticated)
    path('sections/', views.SectionListCreateView.as_view(), name='section-list'),
    path('sections/reorder/', views.SectionReorderView.as_view(), name='section-reorder'),
    path('sections/<int:pk>/', views.SectionDetailView.as_view(), name='section-detail'),

    # Content Blocks (authenticated)
    path('blocks/', views.ContentBlockCreateView.as_view(), name='block-create'),
    path('blocks/reorder/', views.BlockReorderView.as_view(), name='block-reorder'),
    path('blocks/<int:pk>/', views.ContentBlockDetailView.as_view(), name='block-detail'),

    # Master Admin user management (superuser only)
    path('admin/users/', views.UserAdminListView.as_view(), name='user-admin-list'),
    path('admin/users/<int:pk>/', views.UserAdminDestroyView.as_view(), name='user-admin-destroy'),

    # Access Control (superuser only)
    path('admin/access/', views.UserAccessListView.as_view(), name='access-list'),
    path('admin/access/<int:pk>/', views.UserAccessUpdateView.as_view(), name='access-update'),

    # Access Status (authenticated user — check own status)
    path('access/status/', views.UserAccessStatusView.as_view(), name='access-status'),

    # Gemini AI
    path('ai/assist/', views.AIWriterView.as_view(), name='ai-assist'),
]
