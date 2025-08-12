<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->string('external_ref')->nullable(); // from SMS/voice provider, etc.
            $table->enum('channel', ['web','sms','voice'])->default('web');
            $table->enum('category', ['medical','fire','police']);
            $table->enum('status', ['new','en_route','on_scene','resolved'])->default('new');
            $table->unsignedTinyInteger('priority')->default(3); // 1-high, 5-low
            $table->string('reporter_name')->nullable();
            $table->string('reporter_phone')->nullable();
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category','status']);
            $table->index(['latitude','longitude']);
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
