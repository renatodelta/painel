<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TesteController;

Route::get('/teste', function () {
    return "Laravel funcionando com Docker 🚀";
});

Route::get('/controller', [TesteController::class, 'index']);