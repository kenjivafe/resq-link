<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('incident_id');
            $table->enum('type', ['photo','video','audio','file'])->default('photo');
            $table->string('path'); // local or S3 path
            $table->json('meta')->nullable();
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('incident_id')->references('id')->on('incidents')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['incident_id','type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
