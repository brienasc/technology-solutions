<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\DB;
use App\Models\Perfis;

class PerfisService
{
    public function indexAllPerfis()
    {
        return Perfis::all();
    }
}
