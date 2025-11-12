from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""
    
    list_display = ('username', 'email', 'role', 'status', 'face_id_enabled', 'last_login')
    list_filter = ('role', 'status', 'face_id_enabled', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('MediConnect Fields', {
            'fields': ('role', 'face_id_enabled', 'face_encoding', 'status', 'caregivers')
        }),
    )
    
    filter_horizontal = ('caregivers',) + BaseUserAdmin.filter_horizontal
