from django.contrib import admin
from .models import (
    PatientProfile, HealthInfo, VitalSign, SleepLog,
    HeartRateLog, BloodPressureLog, BloodOxygenLog,
    HealthDocument, ClinicalNote
)


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    search_fields = ('user__username', 'user__email')


@admin.register(HealthInfo)
class HealthInfoAdmin(admin.ModelAdmin):
    list_display = ('patient', 'blood_type', 'date_of_birth')
    search_fields = ('patient__user__username',)


@admin.register(VitalSign)
class VitalSignAdmin(admin.ModelAdmin):
    list_display = ('health_info', 'date', 'blood_pressure', 'heart_rate', 'bmi')
    list_filter = ('date',)


@admin.register(SleepLog)
class SleepLogAdmin(admin.ModelAdmin):
    list_display = ('health_info', 'date', 'duration', 'quality')
    list_filter = ('date', 'quality')


@admin.register(HeartRateLog)
class HeartRateLogAdmin(admin.ModelAdmin):
    list_display = ('health_info', 'date', 'time', 'rate')
    list_filter = ('date',)


@admin.register(BloodPressureLog)
class BloodPressureLogAdmin(admin.ModelAdmin):
    list_display = ('health_info', 'date', 'time', 'systolic', 'diastolic')
    list_filter = ('date',)


@admin.register(BloodOxygenLog)
class BloodOxygenLogAdmin(admin.ModelAdmin):
    list_display = ('health_info', 'date', 'time', 'level')
    list_filter = ('date',)


@admin.register(HealthDocument)
class HealthDocumentAdmin(admin.ModelAdmin):
    list_display = ('health_info', 'name', 'document_type', 'uploaded_at')
    list_filter = ('document_type', 'uploaded_at')


@admin.register(ClinicalNote)
class ClinicalNoteAdmin(admin.ModelAdmin):
    list_display = ('health_info', 'date', 'note_type', 'clinician')
    list_filter = ('note_type', 'date')

