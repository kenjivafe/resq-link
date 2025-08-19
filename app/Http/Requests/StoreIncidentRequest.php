<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreIncidentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category' => 'required|in:medical,fire,police',
            'priority' => 'nullable|integer|min:1|max:5',
            'description' => 'nullable|string',
            'occurred_at' => 'nullable|date',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',

            // caller info maps to reporter_* columns
            'caller_name' => 'nullable|string|max:255',
            'caller_contact' => 'nullable|string|max:255',

            // extras captured into dispatch_details JSON
            'patient_status' => 'nullable|in:CONSCIOUS,UNCONSCIOUS',
            'responders' => 'nullable|array',
            'responders.*' => 'string|max:255',
            'responders_other' => 'nullable|string|max:255',
            'proceed_to_scene_time' => 'nullable|date_format:H:i',
            'touchdown_scene_time' => 'nullable|date_format:H:i',
            'proceed_to_hospital_time' => 'nullable|date_format:H:i',
            'touchdown_hospital_time' => 'nullable|date_format:H:i',
            'touchdown_base_time' => 'nullable|date_format:H:i',
            'proceed_to_comment_section' => 'nullable|in:Yes,No',
            'vehicular_reason' => 'nullable|string',
            'note1' => 'nullable|string',
        ];
    }
}
