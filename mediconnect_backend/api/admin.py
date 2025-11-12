from django.contrib import admin
from .models import AuditLog, PlatformSettings


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'actor', 'target', 'target_type', 'timestamp')
    list_filter = ('action', 'target_type', 'timestamp')
    search_fields = ('action', 'actor__username', 'target__username', 'details')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'


@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    list_display = ('updated_at', 'updated_by')
    readonly_fields = ('updated_at', 'updated_by')

