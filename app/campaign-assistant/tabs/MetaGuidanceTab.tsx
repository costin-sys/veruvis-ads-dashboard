'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  options?: string[];
  advice?: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Definește Obiectivul Campaniei',
    description: 'Selectează ce dorești să realizezi cu această campanie',
    options: ['Awareness (Conștientizare)', 'Trafic Website', 'Conversii', 'Lead-uri', 'Vânzări'],
  },
  {
    id: 2,
    title: 'Definește Audiența',
    description: 'Caracterizează persoanele pe care dorești să le atingi',
    options: ['Vârstă', 'Interese', 'Locație', 'Lookalike Audience', 'Remarketing'],
  },
  {
    id: 3,
    title: 'Stabilește Budget și Durată',
    description: 'Alege bugetul zilnic și durata campaniei',
    options: ['Budget zilnic', 'Durată (zile)', 'Frecvență', 'Zi de început'],
  },
  {
    id: 4,
    title: 'Alege Tip Creative',
    description: 'Selectează formatul content-ului pentru anunțuri',
    options: ['Imagine Statică', 'Video', 'Carousel', 'Slideshow', 'Collection'],
  },
  {
    id: 5,
    title: 'Setări Tehnice',
    description: 'Configurează pixelul și evenimentele de conversie',
    options: ['Pixel instalat', 'Evenimente definite', 'Placements', 'Device Targeting'],
  },
];

const ADVICE_WELLNESS: { [key: number]: string } = {
  1: 'Pentru industria sănătății și wellness, recomandăm să pornești cu Awareness + Trafic pentru a construi încredere și pentru a educa audiența. Lead-urile și conversiile vin mai târziu, după ce oamenii te cunosc.',
  2: 'În wellness, audiența ideală are interese în: fitness, nutritie, sănătate holistică, yoga, meditație. Folosește lookalike din clienții tăi cu cel mai mare lifetime value.',
  3: 'Pentru wellness, un budget zilnic de 10-50 RON e bun pentru început. Rulează campaniile minimum 2-3 săptămâni ca să colectezi suficientă dată pentru optimizare.',
  4: 'Videoclipurile cu rezultate reale ale clienților funcționează cel mai bine în wellness. Alternează cu imagini inspiraționale și testimoniale scrise. Evită fake results.',
  5: 'Instalează pixelul corect pe checkout și pe pagina de mulțumire. Definește conversii pentru: achiziție produs, abonare, consultation. Testează pixelul înainte de a activa bugetul.',
};

export default function MetaGuidanceTab() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState<{ [key: number]: string[] }>({});
  const [selectedAdvice, setSelectedAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const step = STEPS[currentStep - 1];

  const handleSelection = (option: string) => {
    const current = selections[currentStep] || [];
    if (current.includes(option)) {
      setSelections({
        ...selections,
        [currentStep]: current.filter((o) => o !== option),
      });
    } else {
      setSelections({
        ...selections,
        [currentStep]: [...current, option],
      });
    }
  };

  const handleAIAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const response = await fetch('/api/analyze/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'meta-step-advice',
          step: currentStep,
          stepTitle: step.title,
          selections: selections[currentStep] || [],
          industry: 'sănătate/wellness',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSelectedAdvice(data.advice);
      } else {
        setSelectedAdvice(ADVICE_WELLNESS[currentStep]);
      }
    } catch (error) {
      console.error('Error fetching AI advice:', error);
      setSelectedAdvice(ADVICE_WELLNESS[currentStep]);
    } finally {
      setLoadingAdvice(false);
    }
  };

  const canProceed = selections[currentStep] && selections[currentStep].length > 0;

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between mb-4">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  s.id <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {s.id < currentStep ? '✓' : s.id}
              </div>
              <p className="text-xs text-slate-600 mt-2 text-center max-w-24">
                Pasul {s.id}
              </p>
            </div>
          ))}
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Pasul {currentStep}: {step.title}
          </h2>
          <p className="text-slate-600 mt-2">{step.description}</p>
        </div>

        {/* Options */}
        {step.options && (
          <div className="space-y-3">
            {step.options.map((option) => {
              const isSelected = selections[currentStep]?.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => handleSelection(option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className="font-medium text-slate-900">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* AI Advice Button */}
        <button
          onClick={handleAIAdvice}
          disabled={loadingAdvice}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          {loadingAdvice ? 'Se încarcă consilul AI...' : 'Sfat AI pentru acest pas'}
        </button>

        {/* AI Advice Display */}
        {selectedAdvice && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <div className="flex gap-3">
              <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-900 mb-2">💡 Sfat AI pentru industria wellness:</p>
                <p className="text-slate-700 leading-relaxed">{selectedAdvice}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          Înapoi
        </button>

        {currentStep < STEPS.length ? (
          <button
            onClick={() => setCurrentStep(Math.min(STEPS.length, currentStep + 1))}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              !canProceed
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Înainte
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-all"
          >
            ✓ Finalizat
          </button>
        )}
      </div>

      {/* Summary */}
      {Object.keys(selections).length > 0 && (
        <div className="bg-slate-100 rounded-lg p-6">
          <h3 className="font-bold text-slate-900 mb-4">📋 Rezumat configurare:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STEPS.map((s) => (
              <div key={s.id} className="bg-white p-4 rounded-lg">
                <p className="font-semibold text-slate-900 text-sm mb-2">Pasul {s.id}: {s.title}</p>
                {selections[s.id] && selections[s.id].length > 0 ? (
                  <div className="space-y-1">
                    {selections[s.id].map((sel) => (
                      <p key={sel} className="text-sm text-slate-600">
                        ✓ {sel}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Necompletate</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
