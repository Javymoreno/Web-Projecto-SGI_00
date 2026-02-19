import { useState, useEffect } from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import IntegratedTreeView from './components/IntegratedTreeView';
import AnalisisPlanificacion from './components/AnalisisPlanificacion';
import CosteComparativaTreeView from './components/CosteComparativaTreeView';
import ContratoComparativaTreeView from './components/ContratoComparativaTreeView';
import PartidaDesviacionView from './components/PartidaDesviacionView';
import CertidumbreView from './components/CertidumbreView';
import LoginScreen from './components/LoginScreen';
import { fetchAnalisisDetallado, fetchObras, fetchCoefK, saveCoefK, AnalisisDetallado, supabase } from './lib/supabase';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [data, setData] = useState<AnalisisDetallado[]>([]);
  const [obras, setObras] = useState<string[]>([]);
  const [allowedObras, setAllowedObras] = useState<string[]>([]);
  const [selectedObra, setSelectedObra] = useState<string>('');
  const [analisisVersion, setAnalisisVersion] = useState<number>(0);
  const [analisisVersions, setAnalisisVersions] = useState<number[]>([0]);
  const [contratoVersion, setContratoVersion] = useState<number>(0);
  const [contratoVersions, setContratoVersions] = useState<number[]>([0]);
  const [costeVersion, setCosteVersion] = useState<number>(0);
  const [costeVersions, setCosteVersions] = useState<number[]>([0]);
  const [costeVersionComp1, setCosteVersionComp1] = useState<number>(0);
  const [costeVersionComp2, setCosteVersionComp2] = useState<number>(1);
  const [contratoVersionComp1, setContratoVersionComp1] = useState<number>(0);
  const [contratoVersionComp2, setContratoVersionComp2] = useState<number>(1);
  const [coefK, setCoefK] = useState<number>(1.0);
  const [coefKInput, setCoefKInput] = useState<string>('1.00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'detallado' | 'planificacion' | 'comparativa' | 'comparativaContrato' | 'desviacion' | 'certidumbre'>('detallado');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: userData } = await supabase
          .from('Users')
          .select('Aceptado, obras')
          .eq('auth_user_id', session.user.id)
          .maybeSingle();

        if (userData && userData.Aceptado) {
          setIsAuthenticated(true);
          setAllowedObras(userData.obras || []);
          setUserEmail(session.user.email || '');
          setAuthChecking(false);
          loadObras(userData.obras);
        } else {
          setIsAuthenticated(false);
          setAuthChecking(false);
        }
      } else {
        setIsAuthenticated(false);
        setAuthChecking(false);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      setIsAuthenticated(false);
      setAuthChecking(false);
    }
  }

  useEffect(() => {
    if (selectedObra) {
      loadAnalisisVersions();
      loadContratoVersions();
      loadCosteVersions();
    }
  }, [selectedObra]);

  useEffect(() => {
    if (selectedObra) {
      loadCoefK();
    }
  }, [selectedObra, costeVersion]);

  useEffect(() => {
    if (selectedObra && coefK > 0) {
      loadObraData();
    }
  }, [selectedObra, analisisVersion, coefK, costeVersion]);

  async function loadObras(permissions?: string[]) {
    try {
      setLoading(true);
      setError(null);

      const obrasData = await fetchObras();
      let uniqueObras = Array.from(new Set(obrasData.map(o => o.cod_obra)));

      const effectivePermissions = permissions || allowedObras || [];
      if (!effectivePermissions.includes('todas')) {
        uniqueObras = uniqueObras.filter(o => effectivePermissions.includes(o));
      }

      setObras(uniqueObras);

      if (uniqueObras.length === 0) {
        setError('No se encontraron obras autorizadas');
        setLoading(false);
        return;
      }

      if (!selectedObra && uniqueObras.length > 0) {
        setSelectedObra(uniqueObras[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar obras');
      setLoading(false);
    }
  }

  async function loadObraData() {
    if (!selectedObra) return;

    try {
      setLoading(true);
      setError(null);

      console.log('=== CARGANDO DATOS CON:', { selectedObra, analisisVersion, coefK, costeVersion });
      const analisisData = await fetchAnalisisDetallado(selectedObra, analisisVersion, coefK, costeVersion);
      console.log('=== DATOS CARGADOS, total filas:', analisisData.length);
      setData(analisisData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos de la obra');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    await Promise.all([
      loadObras(),
      selectedObra ? loadObraData() : Promise.resolve(),
      selectedObra ? loadCoefK() : Promise.resolve(),
      selectedObra ? loadAnalisisVersions() : Promise.resolve(),
      selectedObra ? loadContratoVersions() : Promise.resolve(),
      selectedObra ? loadCosteVersions() : Promise.resolve()
    ]);
  }

  async function loadAnalisisVersions() {
    try {
      console.log('🔍 Loading analisis versions for obra:', selectedObra);
      const { data, error } = await supabase.rpc('get_distinct_versions', {
        table_name: 'lineas_analisis',
        obra_code: selectedObra
      });

      if (error) {
        console.error('❌ Error in query:', error);
        throw error;
      }

      console.log('📊 Distinct versions received:', data);
      const uniqueVersions = data && data.length > 0 ? [...data].sort((a, b) => b - a) : [0];
      console.log('✅ Unique versions found (sorted):', uniqueVersions);
      setAnalisisVersions(uniqueVersions);
      if (uniqueVersions.length > 0) {
        setAnalisisVersion(uniqueVersions[0]);
      }
    } catch (err) {
      console.error('❌ Error loading analisis versions:', err);
      setAnalisisVersions([0]);
    }
  }

  async function loadContratoVersions() {
    try {
      console.log('🔍 Loading contrato versions for obra:', selectedObra);
      const { data, error } = await supabase.rpc('get_distinct_versions', {
        table_name: 'lineas_contrato',
        obra_code: selectedObra
      });

      if (error) {
        console.error('❌ Error in query:', error);
        throw error;
      }

      console.log('📊 Distinct contrato versions received:', data);
      const uniqueVersions = data && data.length > 0 ? [...data].sort((a, b) => b - a) : [0];
      console.log('✅ Unique contrato versions found (sorted):', uniqueVersions);
      setContratoVersions(uniqueVersions);
      if (uniqueVersions.length > 0) {
        setContratoVersion(uniqueVersions[0]);
        setContratoVersionComp1(uniqueVersions[0]);
      }
      if (uniqueVersions.length > 1) {
        setContratoVersionComp2(uniqueVersions[1]);
      } else if (uniqueVersions.length > 0) {
        setContratoVersionComp2(uniqueVersions[0]);
      }
    } catch (err) {
      console.error('❌ Error loading contrato versions:', err);
      setContratoVersions([0]);
    }
  }

  async function loadCosteVersions() {
    try {
      console.log('🔍 Loading coste versions for obra:', selectedObra);
      const { data, error } = await supabase.rpc('get_distinct_versions', {
        table_name: 'lineas_coste',
        obra_code: selectedObra
      });

      if (error) {
        console.error('❌ Error in query:', error);
        throw error;
      }

      console.log('📊 Distinct coste versions received:', data);
      const uniqueVersions = data && data.length > 0 ? [...data].sort((a, b) => b - a) : [0];
      console.log('✅ Unique coste versions found (sorted):', uniqueVersions);
      setCosteVersions(uniqueVersions);
      if (uniqueVersions.length > 0) {
        setCosteVersion(uniqueVersions[0]);
        setCosteVersionComp1(uniqueVersions[0]);
      }
      if (uniqueVersions.length > 1) {
        setCosteVersionComp2(uniqueVersions[1]);
      } else if (uniqueVersions.length > 0) {
        setCosteVersionComp2(uniqueVersions[0]);
      }
    } catch (err) {
      console.error('❌ Error loading coste versions:', err);
      setCosteVersions([0]);
    }
  }

  async function loadCoefK() {
    try {
      const k = await fetchCoefK(selectedObra, costeVersion);
      setCoefK(k);
      setCoefKInput(k.toFixed(2));
    } catch (err) {
      console.error('Error loading coef K:', err);
    }
  }

  function handleCoefKChange(value: string) {
    setCoefKInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setCoefK(numValue);
    }
  }

  async function saveK() {
    if (selectedObra && coefK > 0) {
      try {
        await saveCoefK(selectedObra, costeVersion, coefK);
        alert('✅ Coeficiente K actualizado correctamente.');
      } catch (err) {
        console.error('Error saving coef K:', err);
        alert('❌ Error al guardar: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  }

  async function handleLoginSuccess() {
    await checkAuth();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail('');
    setData([]);
    setObras([]);
    setSelectedObra('');
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-slate-800">Error</h2>
          </div>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="Captura de pantalla 2025-10-21 a las 20.27.29.png"
                alt="Grupo INEXO Logo"
                className="h-12"
              />
              <h1 className="text-2xl font-bold text-slate-900">
                SISTEMA DE GESTIÓN GRUPO INEXO
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm text-slate-600 mr-2">Obra:</label>
                <select
                  value={selectedObra}
                  onChange={(e) => setSelectedObra(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {obras.map((obra) => (
                    <option key={obra} value={obra}>
                      {obra}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Coef. de paso K:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={coefKInput}
                  onChange={(e) => handleCoefKChange(e.target.value)}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  onClick={saveK}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Actualizar
                </button>
              </div>

              {activeView !== 'comparativa' && activeView !== 'comparativaContrato' && (
                <div>
                  <label className="text-sm text-slate-600 mr-2">Análisis:</label>
                  <select
                    value={analisisVersion}
                    onChange={(e) => setAnalisisVersion(Number(e.target.value))}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {analisisVersions.map((version) => (
                      <option key={version} value={version}>
                        Versión {version}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeView === 'comparativa' ? (
                <>
                  <div>
                    <label className="text-sm text-slate-600 mr-2">Coste 1:</label>
                    <select
                      value={costeVersionComp1}
                      onChange={(e) => setCosteVersionComp1(Number(e.target.value))}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {costeVersions.map((version) => (
                        <option key={version} value={version}>
                          Versión {version}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 mr-2">Coste 2:</label>
                    <select
                      value={costeVersionComp2}
                      onChange={(e) => setCosteVersionComp2(Number(e.target.value))}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {costeVersions.map((version) => (
                        <option key={version} value={version}>
                          Versión {version}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : activeView === 'comparativaContrato' ? (
                <>
                  <div>
                    <label className="text-sm text-slate-600 mr-2">Contrato 1:</label>
                    <select
                      value={contratoVersionComp1}
                      onChange={(e) => setContratoVersionComp1(Number(e.target.value))}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {contratoVersions.map((version) => (
                        <option key={version} value={version}>
                          Versión {version}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 mr-2">Contrato 2:</label>
                    <select
                      value={contratoVersionComp2}
                      onChange={(e) => setContratoVersionComp2(Number(e.target.value))}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {contratoVersions.map((version) => (
                        <option key={version} value={version}>
                          Versión {version}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-slate-600 mr-2">Contrato:</label>
                    <select
                      value={contratoVersion}
                      onChange={(e) => setContratoVersion(Number(e.target.value))}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {contratoVersions.map((version) => (
                        <option key={version} value={version}>
                          Versión {version}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 mr-2">Coste:</label>
                    <select
                      value={costeVersion}
                      onChange={(e) => setCosteVersion(Number(e.target.value))}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {costeVersions.map((version) => (
                        <option key={version} value={version}>
                          Versión {version}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Actualizar
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>

        </div>
      </header>

      <main className="w-full px-2 py-6">
        <div className="mb-4 flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('detallado')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeView === 'detallado'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
            >
              Análisis Detallado SGI - Árbol
            </button>
            <button
              onClick={() => setActiveView('desviacion')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeView === 'desviacion'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
            >
              Partidas con mayor Desviación
            </button>
            <button
              onClick={() => setActiveView('comparativa')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeView === 'comparativa'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
            >
              Comparativa Coste vs Coste
            </button>
            <button
              onClick={() => setActiveView('comparativaContrato')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeView === 'comparativaContrato'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
            >
              Comparativa Contrato vs Contrato
            </button>
            <button
              onClick={() => setActiveView('planificacion')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeView === 'planificacion'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
            >
              Análisis Planificación
            </button>
            <button
              onClick={() => setActiveView('certidumbre')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeView === 'certidumbre'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
            >
              Certidumbre
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-300">
            <span className="text-sm text-slate-600">Usuario:</span>
            <span className="text-sm font-medium text-slate-800">{userEmail}</span>
          </div>
        </div>

        {activeView === 'detallado' ? (
          <IntegratedTreeView
            data={data}
            analisisVersion={analisisVersion}
            contratoVersion={contratoVersion}
            costeVersion={costeVersion}
            coefK={coefK}
          />
        ) : activeView === 'desviacion' ? (
          <PartidaDesviacionView
            data={data}
            analisisVersion={analisisVersion}
            contratoVersion={contratoVersion}
            costeVersion={costeVersion}
            coefK={coefK}
          />
        ) : activeView === 'comparativa' ? (
          <CosteComparativaTreeView
            data={data}
            costeVersion1={costeVersionComp1}
            costeVersion2={costeVersionComp2}
            coefK={coefK}
          />
        ) : activeView === 'comparativaContrato' ? (
          <ContratoComparativaTreeView
            data={data}
            contratoVersion1={contratoVersionComp1}
            contratoVersion2={contratoVersionComp2}
          />
        ) : activeView === 'certidumbre' ? (
          <CertidumbreView
            data={data}
            analisisVersion={analisisVersion}
            contratoVersion={contratoVersion}
            costeVersion={costeVersion}
            coefK={coefK}
          />
        ) : (
          <AnalisisPlanificacion
            codObra={selectedObra}
            analisisVersion={analisisVersion}
            contratoVersion={contratoVersion}
            costeVersion={costeVersion}
            coefK={coefK}
          />
        )}
      </main>

      <div className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 text-xs font-medium text-slate-500 z-50">
        by Javier García
      </div>
    </div>
  );
}
