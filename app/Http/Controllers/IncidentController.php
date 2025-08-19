<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIncidentRequest;
use App\Models\Incident;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $incidents = Incident::select([
                'id',
                'category',
                'priority',
                'description',
                'caller_name',
                'caller_contact',
                'patient_status',
                'occurred_at',
                'created_at',
                'updated_at'
            ])
            ->latest()
            ->paginate(15);
            
        return inertia('incidents/index', [
            'incidents' => $incidents->items(),
            'pagination' => [
                'current_page' => $incidents->currentPage(),
                'last_page' => $incidents->lastPage(),
                'per_page' => $incidents->perPage(),
                'total' => $incidents->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreIncidentRequest $request)
    {
        $data = $request->validated();
        
        // Prepare the data for mass assignment
        $incidentData = [
            'category' => $data['category'],
            'priority' => (int)($data['priority'] ?? 3),
            'description' => $data['description'] ?? null,
            'occurred_at' => $data['occurred_at'] ?? now(),
            'latitude' => $data['latitude'] ? (float)$data['latitude'] : null,
            'longitude' => $data['longitude'] ? (float)$data['longitude'] : null,
            'caller_name' => $data['caller_name'] ?? null,
            'caller_contact' => $data['caller_contact'] ?? null,
            'patient_status' => $data['patient_status'] ?? null,
            'responders' => $data['responders'] ?? [],
            'responders_other' => $data['responders_other'] ?? null,
            'proceed_to_comment_section' => $data['proceed_to_comment_section'] ?? 'No',
            'vehicular_reason' => $data['vehicular_reason'] ?? null,
            'note1' => $data['note1'] ?? null,
        ];
        
        // Add time fields if they exist
        $timeFields = [
            'proceed_to_scene_time',
            'touchdown_scene_time',
            'proceed_to_hospital_time',
            'touchdown_hospital_time',
            'touchdown_base_time',
        ];
        
        foreach ($timeFields as $field) {
            if (!empty($data[$field])) {
                $incidentData[$field] = $data[$field];
            }
        }

        $incident = Incident::create($incidentData);

        return redirect()->route('incidents.index')
            ->with('success', 'Incident created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
