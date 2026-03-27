'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Sparkles, AlertCircle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  description: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Strategie
  {
    id: 'obj-smart',
    title: 'Obiective SMART definite',
    category: 'Strategie',
    description: 'Obiective cu valori concrete (ex: 100 leads, 50 conversii)',
  },
  {
    id: 'kpi-defined',
    title: 'KPIs definiți',
    category: 'Strategie',
    description: 'Metricile pe care ți le urmărești (CTR, CPA, ROAS)',
  },
  {
    id: 'budget-approved',
    title: 'Buget aprobat',
    category: 'Strategie',
    description: 'Bugetul campaniei e aprobat de management',
  },
  {
    id: 'timeline',
    title: 'Timeline stabilit',
    category: 'Strategie',
    description: 'Data de start și end pentru campanie',
  },

  // Audiență
  {
    id: 'personas',
    title: 'Personas definite',
    category: 'Audiență',
    description: 'Profiler detaliate ale audienceii țintă',
  },
  {
    id: 'remarketing-lists',
    title: 'Liste de remarketing',
    category: 'Audiență',
    description: 'Segmente pentru retargeting: visitors, cart abandoners',
  },
  {
    id: 'exclusions',
    title: 'Excluderi definite',
    category: 'Audiență',
    description: 'Exclude clienții existenți, brand haters, etc.',
  },
  {
    id: 'lookalike',
    title: 'Lookalike audiences',
    category: 'Audiență',
    description: 'Audiențe similare cu cei mai buni clienți',
  },

  // Creative
  {
    id: 'images-ready',
    title: 'Imagini/Video pregătite',
    category: 'Creative',
    description: 'Assets grafice în format corect (1200x628, etc)',
  },
  {
    id: 'copy-approved',
    title: 'Texte aprobate',
    category: 'Creative',
    description: 'Headlines și descriptions revizuite și aprobate',
  },
  {
    id: 'landing-page',
    title: 'Landing page optimizată',
    category: 'Creative',
    description: 'Pagina are CTA clar, imagini relevante, mobile-friendly',
  },
  {
    id: 'ab-test-ready',
    title: 'Variante pentru A/B test',
    category: 'Creative',
    description: 'Minim 2 variante de imagini și texte',
  },

  // Tehnic
  {
    id: 'pixel-installed',
    title: 'Pixel instalat',
    category: 'Tehnic',
    description: 'Meta/Google pixel corect pe website',
  },
  {
    id: 'conversions-tested',
    title: 'Conversii testate',
    category: 'Tehnic',
    description: 'Events fired corect în Test Events Manager',
  },
  {
    id: 'utm-parameters',
    title: 'UTM parameters configurate',
    category: 'Tehnic',
    description: 'utm_source, utm_medium, utm_campaign setate consistent',
  },
  {
    id: 'analytics-linked',
    title: 'GA4 linked cu Meta/Google',
    category: 'Tehnic',
    description: 'Conversii GA4 sunt viewable în Meta/Google',
  },

  // Legal
  {
    id: 'gdpr-compliant',
    title: 'GDPR compliant',
    category: 'Legal',
    description: 'Disclaimer privind cookies și date collection',
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers healthtech',
    category: 'Legal',
    description: 'Notă: "Nu replace-uiește consultația cu medicul"',
  },
  {
    id: 'cookies-policy',
    title: 'Politică cookies',
    category: 'Legal',
    description: 'Politica cookies e ușor de găsit și înțeles',
  },
  {
    id: 'terms-updated',
    title: 'Terms of Service updated',
    category: 'Legal',
    description: 'ToS sunt actualizate cu noile servicii/produse',
  },
];

export default function ChecklistTab() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const categories = ['Strategie', 'Audiență', 'Creative', 'Tehnic', 'Legal'];
  const categoryItems: { [key: string]: ChecklistItem[] } = {};
  categories.forEach((cat) => {
    categoryItems[cat] = CHECKLIST_ITEMS.filter((item) => item.category === cat);
  });

  const completionPercentage = Math.round((checkedItems.size / CHECKLIST_ITEMS.length) * 100);
  const uncheckedItems = CHECKLIST_ITEMS.filter((item) => !checkedItems.has(item.id));

  const handleAnalyzeChecklist = async () => {
    setLoadingAnalysis(true);
    try {
      const response = await fetch('/api/analyze/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checklist-analysis',
          uncheckedItems: uncheckedItems.map((item) => ({
            title: item.title,
            category: item.category,
            description: item.description,
          })),
          industry: 'sănătate/wellness',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error analyzing checklist:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Progresul Checklistului</h2>
            <p className="text-slate-600 mt-1">
              {checkedItems.size} din {CHECKLIST_ITEMS.length} itemuri completate
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-blue-600">{completionPercentage}%</div>
          </div>
        </div>

        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        {completionPercentage === 100 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <p className="text-green-700 font-semibold">
              🎉 Excelent! Toți itemii checklistului sunt completați!
            </p>
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyzeChecklist}
        disabled={loadingAnalysis || checkedItems.size === CHECKLIST_ITEMS.length}
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
      >
        <Sparkles className="w-5 h-5" />
        {loadingAnalysis ? 'Se analizează checklistul...' : 'Analizează checklistul (AI)'}
      </button>

      {/* AI Recommendations */}
      {recommendations && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900 mb-3">🎯 Recomandări prioritare:</p>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{recommendations}</p>
            </div>
          </div>
        </div>
      )}

      {/* Checklist by Category */}
      {categories.map((category) => {
        const items = categoryItems[category];
        const categoryChecked = items.filter((item) => checkedItems.has(item.id)).length;
        const categoryPercentage = Math.round((categoryChecked / items.length) * 100);

        return (
          <div key={category} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">{category}</h3>
              <span className="text-sm font-semibold text-slate-600">
                {categoryChecked}/{items.length}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${categoryPercentage}%` }}
              ></div>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="w-full p-4 text-left rounded-lg border-2 transition-all hover:border-blue-300"
                  style={{
                    borderColor: checkedItems.has(item.id) ? '#2563eb' : '#e2e8f0',
                    backgroundColor: checkedItems.has(item.id) ? '#eff6ff' : '#f8fafc',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {checkedItems.has(item.id) ? (
                      <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p
                        className="font-semibold text-slate-900"
                        style={{
                          textDecoration: checkedItems.has(item.id) ? 'line-through' : 'none',
                          opacity: checkedItems.has(item.id) ? 0.6 : 1,
                        }}
                      >
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
