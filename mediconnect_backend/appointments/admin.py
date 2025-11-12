from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'date', 'time', 'status', 'appointment_type')
    list_filter = ('status', 'appointment_type', 'date')
    search_fields = ('patient__username', 'doctor__username', 'reason')
    date_hierarchy = 'date'
