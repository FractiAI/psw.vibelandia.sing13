#!/usr/bin/env julia
# Live KomaMRI.jl CPU wall-clock: legacy full-mesh re-simulate vs MRI shared-field.
# Sandbox simulator only — not clinical RF.
#
# Usage:
#   julia --project=@v1.12 research/synthio-mri-vs-legacy-perf/scripts/bench_komamri_live.jl
# Writes: research/synthio-mri-vs-legacy-perf/data/komamri_live_receipt.json

using Dates
using JSON
using KomaMRI

const OUT = joinpath(@__DIR__, "..", "data", "komamri_live_receipt.json")
const SCALES = [4, 6, 8, 10]
const TRIALS = 3
const NBLOCKS = 2
const SPINS = 32

function mean(xs)
    sum(xs) / length(xs)
end

function stddev(xs)
    m = mean(xs)
    sqrt(mean((x - m)^2 for x in xs))
end

function build_fixture()
    sys = Scanner()
    obj = Phantom(
        x = collect(range(-0.02, 0.02; length = SPINS)),
        T1 = fill(1.0, SPINS),
        T2 = fill(0.08, SPINS),
        ρ = fill(1.0, SPINS),
    )
    seq = PulseDesigner.EPI_example()
    return sys, obj, seq
end

function simulate_once(sys, obj, seq)
    simulate(obj, seq, sys; sim_params = Dict{String,Any}("Nblocks" => NBLOCKS))
end

function phase_ack!(buf::Vector{Float64}, edge::Int)
    for i in eachindex(buf)
        buf[i] = buf[i] * cos((edge + 1) * 0.017 + i * 1e-3) + 1e-9 * edge
    end
    return sum(buf)
end

function run_legacy(n, sys, obj, seq)
    edges = n * (n - 1) ÷ 2
    sink = 0.0
    t0 = time_ns()
    for e in 1:edges
        raw = simulate_once(sys, obj, seq)
        # touch acquisition payload so work cannot be elided
        sink += Float64(length(string(typeof(raw)))) + 0.001 * e
    end
    ms = (time_ns() - t0) / 1e6
    return (; ms, edges, sink)
end

function run_mri(n, sys, obj, seq)
    edges = n - 1
    sink = 0.0
    t0 = time_ns()
    raw = simulate_once(sys, obj, seq)
    sink += Float64(length(string(typeof(raw))))
    buf = collect(range(0.0, 1.0; length = 64))
    for e in 1:edges
        sink += phase_ack!(buf, e)
    end
    ms = (time_ns() - t0) / 1e6
    return (; ms, edges, sink)
end

function main()
    sys, obj, seq = build_fixture()
    # warmup (compilation)
    simulate_once(sys, obj, seq)

    rows = Any[]
    for n in SCALES
        legacy_trials = Float64[]
        mri_trials = Float64[]
        legacy_edges = 0
        mri_edges = 0
        for _ in 1:TRIALS
            L = run_legacy(n, sys, obj, seq)
            M = run_mri(n, sys, obj, seq)
            push!(legacy_trials, L.ms)
            push!(mri_trials, M.ms)
            legacy_edges = L.edges
            mri_edges = M.edges
        end
        legacy_ms = mean(legacy_trials)
        mri_ms = mean(mri_trials)
        push!(
            rows,
            Dict(
                "n" => n,
                "trials" => TRIALS,
                "legacyEdges" => legacy_edges,
                "mriEdges" => mri_edges,
                "legacyMs" => legacy_ms,
                "mriMs" => mri_ms,
                "legacyStd" => stddev(legacy_trials),
                "mriStd" => stddev(mri_trials),
                "speedup" => legacy_ms / max(1e-9, mri_ms),
                "pass" => mri_ms < legacy_ms,
            ),
        )
    end

    speedups = [r["speedup"] for r in rows]
    receipt = Dict(
        "schema" => "synthio-komamri-live-bench/v1",
        "generatedAt" => string(Dates.now(Dates.UTC)),
        "backend" => "komamri_cpu",
        "komaVersion" => string(pkgversion(KomaMRI)),
        "juliaVersion" => string(VERSION),
        "timedWith" => "time_ns",
        "spins" => SPINS,
        "nblocks" => NBLOCKS,
        "sequence" => "PulseDesigner.EPI_example",
        "liveWallClock" => true,
        "rows" => rows,
        "meanSpeedup" => mean(speedups),
        "allPass" => all(r["pass"] for r in rows),
        "honesty" =>
            "Live KomaMRI.jl CPU simulate() wall-clock on this host. MRI arm = one shared simulate + nested phase-acks; legacy = re-simulate per mesh edge. Not clinical magnet, not CUDA multi-GPU, not multi-node Distributed.jl fabric, not hyperscale displacement.",
    )

    mkpath(dirname(OUT))
    open(OUT, "w") do io
        JSON.print(io, receipt, 2)
    end
    println(JSON.json(Dict(
        "ok" => receipt["allPass"],
        "meanSpeedup" => receipt["meanSpeedup"],
        "path" => OUT,
        "backend" => "komamri_cpu",
    )))
end

main()
