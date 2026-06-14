<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ config('app.name', 'Laravel') }} - API Reference</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        <script src="https://cdn.tailwindcss.com"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    </head>
    <body class="bg-[#0f172a] text-slate-200 antialiased font-sans pb-12" x-data="{ currentFilter: 'ALL', search: '' }">
        
        <div class="max-w-6xl mx-auto px-4 pt-12">
            
            <header class="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-8">
                <div>
                    <h1 class="text-4xl font-extrabold text-white tracking-tight">
                        {{ config('app.name', 'Laravel') }} <span class="text-indigo-400 font-mono text-2xl font-normal">/api</span>
                    </h1>
                    <p class="text-slate-400 mt-2">Interactive API endpoint directory for local development.</p>
                </div>
                <div class="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3 self-start">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-xs font-mono text-slate-300">{{ url('/api') }}</span>
                </div>
            </header>

            <div class="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                
                <div class="flex flex-wrap gap-2 w-full md:w-auto">
                    <button @click="currentFilter = 'ALL'" :class="currentFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'" class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                        All ({{ $apiRoutes->count() }})
                    </button>
                    <button @click="currentFilter = 'GET'" :class="currentFilter === 'GET' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-blue-950/40 hover:text-blue-400 border border-transparent hover:border-blue-800'" class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                        GET
                    </button>
                    <button @click="currentFilter = 'POST'" :class="currentFilter === 'POST' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-emerald-950/40 hover:text-emerald-400 border border-transparent hover:border-emerald-800'" class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                        POST
                    </button>
                    <button @click="currentFilter = 'PUT'" :class="currentFilter === 'PUT' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-amber-950/40 hover:text-amber-400 border border-transparent hover:border-amber-800'" class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                        PUT/PATCH
                    </button>
                    <button @click="currentFilter = 'DELETE'" :class="currentFilter === 'DELETE' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 border border-transparent hover:border-rose-800'" class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                        DELETE
                    </button>
                </div>

                <div class="w-full md:w-80">
                    <input x-model="search" type="text" placeholder="Search endpoint URI..." class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                </div>
            </div>

            <div class="space-y-3">
                @forelse($apiRoutes as $route)
                    @php
                        // Kukunin natin yung primary method (basta hindi HEAD)
                        $mainMethod = collect($route['methods'])->filter(fn($m) => $m !== 'HEAD')->first() ?? 'GET';
                    @endphp

                    <div 
                        x-show="(currentFilter === 'ALL' || '{{ $mainMethod }}'.includes(currentFilter)) && ('{{ $route['uri'] }}'.toLowerCase().includes(search.toLowerCase()))"
                        x-transition.duration.200ms
                        class="border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all
                            {{ $mainMethod === 'GET' ? 'bg-blue-950/20 border-blue-900/50 hover:border-blue-700/60' : '' }}
                            {{ $mainMethod === 'POST' ? 'bg-emerald-950/20 border-emerald-900/50 hover:border-emerald-700/60' : '' }}
                            {{ $mainMethod === 'PUT' || $mainMethod === 'PATCH' ? 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700/60' : '' }}
                            {{ $mainMethod === 'DELETE' ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60' : '' }}
                        "
                    >
                        <div class="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                            <div class="w-20 text-center shrink-0">
                                <span class="inline-block w-full py-1.5 text-xs font-black tracking-wide rounded-md font-mono shadow-sm
                                    {{ $mainMethod === 'GET' ? 'bg-blue-500 text-white' : '' }}
                                    {{ $mainMethod === 'POST' ? 'bg-emerald-500 text-white' : '' }}
                                    {{ $mainMethod === 'PUT' || $mainMethod === 'PATCH' ? 'bg-amber-500 text-white' : '' }}
                                    {{ $mainMethod === 'DELETE' ? 'bg-rose-500 text-white' : '' }}
                                ">
                                    {{ $mainMethod }}
                                </span>
                            </div>

                            <div class="font-mono text-base font-semibold text-slate-100">
                                <a href="{{ url($route['uri']) }}" target="_blank" class="hover:underline hover:text-indigo-400 flex items-center gap-1.5">
                                    <span>/{{ $route['uri'] }}</span>
                                    <svg class="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                                </a>
                            </div>
                        </div>

                        <div class="flex flex-wrap md:flex-nowrap items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/80">
                            <div>
                                <span class="text-slate-600 block text-[10px] uppercase tracking-wider font-sans font-bold">Route Name</span>
                                <span class="text-indigo-300">{{ $route['name'] !== 'N/A' ? $route['name'] : 'none' }}</span>
                            </div>
                            <div class="h-6 w-[1px] bg-slate-800 hidden md:block"></div>
                            <div>
                                <span class="text-slate-600 block text-[10px] uppercase tracking-wider font-sans font-bold">Controller / Action</span>
                                <span class="text-slate-300">{{ Str::afterLast($route['action'], 'Controllers\\') }}</span>
                            </div>
                        </div>

                    </div>
                @empty
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 italic">
                        No API routes detected. Ensure you have endpoints registered in <code>routes/api.php</code>.
                    </div>
                @endforelse
            </div>

            <footer class="mt-16 text-center text-xs text-slate-600 font-mono">
                Laravel v{{ Illuminate\Foundation\Application::VERSION }} (PHP v{{ PHP_VERSION }})
            </footer>

        </div>

    </body>
</html>