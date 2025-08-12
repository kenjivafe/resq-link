<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('responder_id');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->float('accuracy')->nullable();
            $table->float('speed')->nullable();
            $table->float('heading')->nullable();
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();

            $table->foreign('responder_id')->references('id')->on('responders')->onDelete('cascade');
            $table->index(['responder_id','recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
