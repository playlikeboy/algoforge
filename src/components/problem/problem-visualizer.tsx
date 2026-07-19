"use client";

import { useState, useEffect, useMemo } from "react";
import { Play, Pause, SkipBack, ChevronRight, RotateCcw, Edit3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface VisualStep {
  index: number;
  val: number;
  complement: number;
  found: boolean;
  mapBefore: Record<number, number>;
  mapAfter: Record<number, number>;
  description: string;
  isComplete: boolean;
}

export function ProblemVisualizer({
  slug,
  fallbackDescription,
}: {
  slug: string;
  fallbackDescription?: string;
}) {
  if (slug !== "two-sum") {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        {fallbackDescription}
      </div>
    );
  }

  return <TwoSumVisualizer />;
}

function TwoSumVisualizer() {
  const [arrayInput, setArrayInput] = useState("2, 7, 11, 15");
  const [targetInput, setTargetInput] = useState("9");
  const [array, setArray] = useState([2, 7, 11, 15]);
  const [target, setTarget] = useState(9);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const steps = useMemo(() => {
    const stepsList: VisualStep[] = [];
    const map: Record<number, number> = {};

    for (let i = 0; i < array.length; i++) {
      const val = array[i];
      const complement = target - val;
      const found = complement in map;
      const mapBefore = { ...map };

      if (found) {
        stepsList.push({
          index: i,
          val,
          complement,
          found: true,
          mapBefore,
          mapAfter: { ...map },
          description: `Looking at index ${i} (value ${val}). Complement is ${target} - ${val} = ${complement}. Success! Found ${complement} in the map at index ${map[complement]}!`,
          isComplete: true,
        });
        break;
      } else {
        map[val] = i;
        stepsList.push({
          index: i,
          val,
          complement,
          found: false,
          mapBefore,
          mapAfter: { ...map },
          description: `Looking at index ${i} (value ${val}). Complement is ${target} - ${val} = ${complement}. Not in map. Storing { ${val}: ${i} } in map.`,
          isComplete: false,
        });
      }
    }

    if (stepsList.length > 0 && !stepsList[stepsList.length - 1].isComplete) {
      stepsList.push({
        index: -1,
        val: -1,
        complement: -1,
        found: false,
        mapBefore: { ...map },
        mapAfter: { ...map },
        description: `Finished scanning the array. No pair sums to ${target}.`,
        isComplete: true,
      });
    }

    return stepsList;
  }, [array, target]);

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [array, target]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const step = steps[currentStep] || {
    index: -1,
    val: 0,
    complement: 0,
    found: false,
    mapBefore: {},
    mapAfter: {},
    description: "",
    isComplete: false,
  };

  const handleApply = () => {
    try {
      const arr = arrayInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")
        .map((s) => {
          const num = parseInt(s, 10);
          if (isNaN(num)) throw new Error("All items must be valid integers.");
          return num;
        });

      if (arr.length < 2) {
        throw new Error("Please enter at least 2 numbers.");
      }

      const tgt = parseInt(targetInput, 10);
      if (isNaN(tgt)) {
        throw new Error("Target must be a valid integer.");
      }

      setArray(arr);
      setTarget(tgt);
      setError("");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Invalid input format.");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-semibold text-base text-foreground">Interactive Visualizer: Two Sum</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Watch how the single-pass Hash Map search works step-by-step
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleApply}>
                <Check className="h-3.5 w-3.5 mr-1" /> Apply
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-3.5 w-3.5 mr-1" /> Customize Input
            </Button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-muted/40 rounded-lg p-4 mt-4 border border-border space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Array (comma separated)
              </label>
              <input
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                className="w-full text-sm bg-background border border-border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 2, 7, 11, 15"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Target Sum
              </label>
              <input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-full text-sm bg-background border border-border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 9"
              />
            </div>
          </div>
          {error && <p className="text-xs text-destructive font-medium">{error}</p>}
        </div>
      )}

      {/* Array Display */}
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Input Array (nums)
        </p>
        <div className="flex flex-wrap gap-2.5">
          {array.map((num, i) => {
            const isCurrent = i === step.index;
            const isMatch = step.found && (i === step.index || step.mapBefore[step.complement] === i);
            return (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground font-mono mb-1">i={i}</span>
                <div
                  className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-300 shadow-sm",
                    isMatch
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 scale-105"
                      : isCurrent
                      ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/20 scale-105"
                      : "bg-muted/50 border-border text-foreground"
                  )}
                >
                  {num}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Map state & Math block */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {/* Hash Map Display */}
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Hash Map State (value → index)
          </p>
          {Object.keys(step.mapBefore).length === 0 ? (
            <div className="text-sm text-muted-foreground italic h-24 flex items-center justify-center border border-dashed border-border rounded-lg bg-card/50">
              Empty map {}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
              {Object.entries(step.mapBefore).map(([k, v]) => {
                const isMatch = step.found && parseInt(k, 10) === step.complement;
                return (
                  <div
                    key={k}
                    className={cn(
                      "flex items-center justify-between text-xs px-2.5 py-1.5 rounded border font-mono transition-all duration-300",
                      isMatch
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "bg-card border-border text-muted-foreground"
                    )}
                  >
                    <span>Key: {k}</span>
                    <span>idx: {v}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Math & Computation Block */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Computation (target = {target})
            </p>
            {step.index !== -1 ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center bg-card border border-border px-3 py-1.5 rounded">
                  <span className="text-muted-foreground">Current Element:</span>
                  <span className="font-bold text-foreground">nums[{step.index}] = {step.val}</span>
                </div>
                <div className="flex justify-between items-center bg-card border border-border px-3 py-1.5 rounded">
                  <span className="text-muted-foreground">Complement:</span>
                  <span className="font-bold text-primary">{target} - {step.val} = {step.complement}</span>
                </div>
                <div className="flex justify-between items-center bg-card border border-border px-3 py-1.5 rounded">
                  <span className="text-muted-foreground">Map Check:</span>
                  <span
                    className={cn(
                      "font-bold",
                      step.found ? "text-emerald-500" : "text-amber-500"
                    )}
                  >
                    map.has({step.complement}) ? {step.found ? "YES" : "NO"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic h-24 flex items-center justify-center">
                Search Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Description */}
      <div className="mt-6 rounded-lg bg-primary/5 border border-primary/10 p-4 text-sm leading-relaxed text-foreground">
        <p className="font-semibold text-primary text-xs uppercase tracking-wider mb-1">Step Details</p>
        {step.description}
      </div>

      {/* Control bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCurrentStep(0);
              setIsPlaying(false);
            }}
            disabled={currentStep === 0}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCurrentStep((p) => Math.max(0, p - 1));
              setIsPlaying(false);
            }}
            disabled={currentStep === 0}
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={() => setIsPlaying((p) => !p)}
            className="w-24"
            variant={isPlaying ? "outline" : "default"}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 mr-1.5" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1.5" /> Play
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCurrentStep((p) => Math.min(steps.length - 1, p + 1));
              setIsPlaying(false);
            }}
            disabled={currentStep === steps.length - 1}
          >
            Next <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
}
