<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notifications_outbox', function (Blueprint $table) {
            $table->id();
            $table->morphs('notifiable'); // notifiable_type, notifiable_id (User, Responder)
            $table->string('channel'); // push, sms, voice
            $table->string('template')->nullable();
            $table->json('payload')->nullable();
            $table->enum('status', ['pending','sent','failed'])->default('pending');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
            $table->index(['channel','status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications_outbox');
    }
};
