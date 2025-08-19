<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Incident extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        // Incident details
        'category',
        'priority',
        'description',
        'occurred_at',
        'latitude',
        'longitude',
        
        // Caller info
        'caller_name',
        'caller_contact',
        
        // Patient status
        'patient_status',
        
        // Responders
        'responders',
        'responders_other',
        
        // Timeline
        'proceed_to_scene_time',
        'touchdown_scene_time',
        'proceed_to_hospital_time',
        'touchdown_hospital_time',
        'touchdown_base_time',
        
        // Comments section
        'proceed_to_comment_section',
        
        // Additional fields
        'vehicular_reason',
        'note1',
    ];
    
    protected $casts = [
        'priority' => 'integer',
        'occurred_at' => 'datetime',
        'responders' => 'array',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'proceed_to_scene_time' => 'string',
        'touchdown_scene_time' => 'string',
        'proceed_to_hospital_time' => 'string',
        'touchdown_hospital_time' => 'string',
        'touchdown_base_time' => 'string',
    ];
}
