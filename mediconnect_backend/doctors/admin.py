from django.contrib import admin
from .models import DoctorProfile


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialization', 'user', 'created_at')
    search_fields = ('name', 'specialization', 'user__username')
    list_filter = ('specialization',)
