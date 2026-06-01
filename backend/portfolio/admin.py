from django.contrib import admin
from .models import Profile, ThemeSettings, Section, ContentBlock


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
