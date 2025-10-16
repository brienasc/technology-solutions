<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Curso;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            $perfil = $user->perfil;
            $perfilNome = $perfil->perfil_name;
            
            \Log::info('Dashboard Debug:', [
                'user_id' => $user->id,
                'user_name' => $user->name ?? $user->nome,
                'perfil_id' => $perfil->perfil_id,
                'perfil_name' => $perfil->perfil_name,
                'perfil_object' => $perfil->toArray()
            ]);
            
            // Se é administrador, vê todos os cursos
            if ($perfilNome === 'Administrador') {
                $cursos = Curso::all();
            } 
            // Se é elaborador, vê apenas cursos associados
            else {
                $cursos = $user->cursos;
            }
            
            $cursosFormatados = $cursos->map(function($curso) {
                return [
                    'id' => $curso->id,
                    'nome' => $curso->nome,
                    'descricao' => $curso->descricao,
                    'carga_horaria' => $curso->carga_horaria,
                    'status' => $curso->status,
                    'quantidade_itens' => 0,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'cursos' => $cursosFormatados,
                    'perfil' => $perfilNome,
                    'total_cursos' => $cursosFormatados->count(),
                ],
                'message' => "Perfil identificado: {$perfilNome}",
                'debug' => [
                    'perfil_original' => $perfilNome,
                    'user_perfil_id' => $perfil->perfil_id
                ],
                'timestamp' => now()
            ]);

        } catch (\Exception $e) {
            \Log::error('Dashboard Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao carregar dados do dashboard: ' . $e->getMessage()
            ], 500);
        }
    }
}