<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('status_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('incident_id');
            $table->enum('status', ['new','en_route','on_scene','resolved']);
            $table->string('note')->nullable();
            $table->unsignedBigInteger('by_user_id')->nullable();
            $table->timestamps();

            $table->foreign('incident_id')->references('id')->on('incidents')->onDelete('cascade');
            $table->foreign('by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->index(['incident_id','status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('status_histories');
    }
};
