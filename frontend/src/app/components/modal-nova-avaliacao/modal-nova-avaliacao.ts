import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Função auxiliar para garantir que a quantidade de itens seja um número inteiro positivo
function positiveIntegerValidator(control: AbstractControl): { [key: string]: any } | null {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null; // A validação 'required' cuidará de campos vazios
  }
  if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
    return { 'positiveInteger': true };
  }
  return null;
}

@Component({
  selector: 'app-modal-nova-avaliacao',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './modal-nova-avaliacao.html',
  styleUrls: ['./modal-nova-avaliacao.css']
})
export class ModalNovaAvaliacaoComponent implements OnInit {
  @Input() cursoId: string | number | null = null; // Recebe o ID do curso (opcional)
  @Output() closeModal = new EventEmitter<void>(); // Evento para notificar o pai (AvaliacoesComponent) para fechar o modal
  
  currentStep: number = 1; // 1 ou 2
  etapa1Form!: FormGroup;
  etapa2Form!: FormGroup;
  
  totalItensCalculado: number = 0;
  
  // Distribuição de dificuldade fixa conforme o requisito do usuário
  readonly DIFICULDADE = {
    FACIL: 0.30, // Fácil/Muito Fácil
    MEDIO: 0.40, // Média
    DIFICIL: 0.30  // Difícil/Muito Difícil
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // --- ETAPA 1: Informações Básicas ---
    this.etapa1Form = this.fb.group({
      nomeAvaliacao: ['', Validators.required],
      // Se o modal for aberto a partir de uma página de curso, o ID pode ser preenchido
      curso: [this.cursoId || '', Validators.required], 
      matriz: ['', Validators.required]
    });

    // --- ETAPA 2: Configuração de Itens ---
    this.etapa2Form = this.fb.group({
      // O campo principal para o cálculo da distribuição
      quantidadeItens: [20, [Validators.required, Validators.min(1), Validators.max(50), positiveIntegerValidator]],
      // Os campos de percentual são apenas para mock (ou se fosse ajustável)
      percentualFacil: [this.DIFICULDADE.FACIL],
      percentualMedio: [this.DIFICULDADE.MEDIO],
      percentualDificil: [this.DIFICULDADE.DIFICIL]
    });

    // Assina mudanças na quantidade de itens para recalcular
    this.etapa2Form.get('quantidadeItens')?.valueChanges.subscribe(value => {
      this.calcularTotalItens(Number(value));
    });
    
    // Calcula o total inicial
    this.calcularTotalItens(this.etapa2Form.value.quantidadeItens);
  }

  /**
   * Recalcula a distribuição de itens com base na quantidade total
   * e nas porcentagens fixas, lidando com arredondamento.
   */
  calcularTotalItens(quantidade: number): void {
    if (quantidade < 1 || !Number.isInteger(quantidade)) {
        this.totalItensCalculado = 0;
        return;
    }
    
    // Calcula os valores base e arredonda
    let facil = Math.floor(quantidade * this.DIFICULDADE.FACIL);
    let medio = Math.floor(quantidade * this.DIFICULDADE.MEDIO);
    let dificil = Math.floor(quantidade * this.DIFICULDADE.DIFICIL);
    
    let totalArredondado = facil + medio + dificil;
    let diferenca = quantidade - totalArredondado;

    // Distribui a diferença de arredondamento (o item "sobrando")
    // Prioriza o Médio, depois Fácil, depois Difícil
    if (diferenca > 0) {
        if (this.DIFICULDADE.MEDIO > this.DIFICULDADE.FACIL && diferenca > 0) {
            medio += 1;
            diferenca--;
        }
        if (diferenca > 0) {
            facil += 1;
            diferenca--;
        }
        if (diferenca > 0) {
            dificil += 1;
            diferenca--;
        }
    }
    
    this.totalItensCalculado = facil + medio + dificil;

    // Opcional: Atualizar os valores (número de itens) no formulário
    this.etapa2Form.patchValue({
      percentualFacil: facil, // Sobrescreve a porcentagem com o número de itens
      percentualMedio: medio,
      percentualDificil: dificil
    }, { emitEvent: false }); // Evita loop de cálculo
  }

  proximaEtapa(): void {
    if (this.etapa1Form.valid) {
      this.currentStep = 2;
    } else {
      this.etapa1Form.markAllAsTouched();
    }
  }

  voltarEtapa(): void {
    this.currentStep = 1;
  }

  criarAvaliacao(): void {
    const totalOk = this.totalItensCalculado === this.etapa2Form.value.quantidadeItens;
    
    if (this.etapa2Form.valid && totalOk) {
      const dadosCompletos = { 
          ...this.etapa1Form.value, 
          // Dados da Etapa 2
          quantidadeTotal: this.etapa2Form.value.quantidadeItens,
          distribuicao: {
              facil_muito_facil_qtd: this.etapa2Form.value.percentualFacil,
              media_qtd: this.etapa2Form.value.percentualMedio,
              dificil_muito_dificil_qtd: this.etapa2Form.value.percentualDificil,
              // As porcentagens fixas podem ser enviadas como metadados
              distribuicao_percentual: {
                 facil_muito_facil: this.DIFICULDADE.FACIL,
                 media: this.DIFICULDADE.MEDIO,
                 dificil_muito_dificil: this.DIFICULDADE.DIFICIL
              }
          }
      };

      console.log('Dados da Avaliação prontos para o Backend:', dadosCompletos);
      // **AQUI: Chamar o Service para enviar os dados para o Backend**
      
      this.fecharModal();
    } else {
      this.etapa2Form.markAllAsTouched();
      // Opcional: Exibir uma mensagem de erro customizada sobre o total
      if (!totalOk) {
         console.error('Erro: O total de itens calculado não corresponde à quantidade total informada.');
      }
    }
  }

  fecharModal(): void {
    this.closeModal.emit();
    // Resetar os formulários e a etapa ao fechar
    this.currentStep = 1;
    this.etapa1Form.reset({ curso: this.cursoId || '' }); 
    this.etapa2Form.reset({ quantidadeItens: 20 });
    this.calcularTotalItens(20);
  }
}
