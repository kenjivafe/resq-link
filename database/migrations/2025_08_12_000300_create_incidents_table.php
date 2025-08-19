<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            // Incident details
            $table->enum('category', ['medical', 'fire', 'police']);
            $table->unsignedTinyInteger('priority')->default(3); // 1-high, 5-low
            $table->text('description')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            
            // Caller info
            $table->string('caller_name')->nullable();
            $table->string('caller_contact')->nullable();
            
            // Patient status
            $table->enum('patient_status', ['CONSCIOUS', 'UNCONSCIOUS'])->nullable();
            
            // Responders (stored as JSON array)
            $table->json('responders')->nullable();
            $table->string('responders_other')->nullable();
            
            // Timeline
            $table->time('proceed_to_scene_time')->nullable();
            $table->time('touchdown_scene_time')->nullable();
            $table->time('proceed_to_hospital_time')->nullable();
            $table->time('touchdown_hospital_time')->nullable();
            $table->time('touchdown_base_time')->nullable();
            
            // Comments section
            $table->enum('proceed_to_comment_section', ['Yes', 'No'])->default('No');
            
            // Additional fields
            $table->string('vehicular_reason')->nullable();
            $table->text('note1')->nullable();
            
            // Standard Laravel timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('category');
            $table->index('priority');
            $table->index('occurred_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
