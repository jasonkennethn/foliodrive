from django.contrib import admin
from .models import Profile, ThemeSettings, Section, ContentBlock, UserAccess


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'tagline', 'show_profile_pic')


@admin.register(ThemeSettings)
class ThemeSettingsAdmin(admin.ModelAdmin):
    list_display = ('mode', 'accent_color', 'font_family')


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_visible')
    list_editable = ('order', 'is_visible')


@admin.register(ContentBlock)
class ContentBlockAdmin(admin.ModelAdmin):
    list_display = ('block_type', 'section', 'title', 'order')
    list_filter = ('block_type', 'section')
    list_editable = ('order',)


@admin.register(UserAccess)
class UserAccessAdmin(admin.ModelAdmin):
    list_display = ('user', 'access_type', 'is_active', 'blocked_by_admin', 'expires_at', 'is_access_valid')
    list_filter = ('access_type', 'is_active', 'blocked_by_admin')
    list_editable = ('is_active', 'blocked_by_admin', 'access_type')
    search_fields = ('user__username', 'user__email')

    def is_access_valid(self, obj):
        return obj.is_access_valid()
    is_access_valid.boolean = True
    is_access_valid.short_description = 'Access Valid'
