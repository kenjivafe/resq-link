<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('incident_id');
            $table->unsignedBigInteger('responder_id');
            $table->unsignedBigInteger('assigned_by')->nullable();
            $table->enum('status', ['assigned','acknowledged','completed'])->default('assigned');
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('incident_id')->references('id')->on('incidents')->onDelete('cascade');
            $table->foreign('responder_id')->references('id')->on('responders')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();
            $table->unique(['incident_id','responder_id']);
            $table->index(['responder_id','status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
