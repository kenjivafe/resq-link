<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('responders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // if responders also have user logins
            $table->string('callsign')->nullable();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->enum('status', ['available','busy','offline'])->default('available');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['status']);
            $table->index(['name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('responders');
    }
};
