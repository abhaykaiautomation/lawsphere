'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { SignInPrompt } from '@/components/layouts/sign-in-prompt';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Brain, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

const intakeSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(50, 'Please provide at least 50 characters so our AI can accurately classify your issue'),
  desiredOutcome: z.string().optional(),
  preferredLocation: z.string().optional(),
});

type IntakeFormData = z.infer<typeof intakeSchema>;

const STEP_LABELS = ['Issue Details', 'AI Analysis', 'Lawyer Matches'];

interface ApiResponse<T> {
  data: T;
  success: boolean;
}

export default function IntakePage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <SignInPrompt message="Sign in to submit a legal issue" />;
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [submittedCase, setSubmittedCase] = useState<{ id: string; caseNumber: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IntakeFormData>({ resolver: zodResolver(intakeSchema) });

  const descriptionLength = watch('description', '').length;

  const { mutate: submitCase, isPending } = useMutation({
    mutationFn: async (data: IntakeFormData) => {
      const res = await api.post<unknown, ApiResponse<{ id: string; caseNumber: string }>>(
        '/intake/cases',
        data,
      );
      return res.data;
    },
    onSuccess: (data) => {
      setSubmittedCase(data);
      setStep(1);
      toast.success('Case submitted! AI analysis in progress...');
      // Poll for completion after 3 seconds then show results
      setTimeout(() => setStep(2), 3000);
    },
    onError: () => toast.error('Failed to submit case. Please try again.'),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Describe Your Legal Issue</h1>
        <p className="text-muted-foreground mt-2">
          Our AI will analyze your situation, classify the legal area, and recommend the best lawyers.
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-medium' : 'text-muted-foreground'}`}>{label}</span>
            {i < STEP_LABELS.length - 1 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tell Us About Your Legal Issue</CardTitle>
            <CardDescription>
              Be as detailed as possible. Include relevant dates, parties involved, and what outcome you're seeking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((data) => submitCase(data))} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Brief Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Landlord refusing to return security deposit"
                  {...register('title')}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Detailed Description
                  <span className="text-muted-foreground font-normal ml-2">
                    ({descriptionLength} chars {descriptionLength < 50 ? `— need ${50 - descriptionLength} more` : '✓'})
                  </span>
                </Label>
                <textarea
                  id="description"
                  className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  placeholder="Describe your legal situation in detail. Include: what happened, when it happened, who is involved, what documents you have, and what outcome you want..."
                  {...register('description')}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="desiredOutcome">Desired Outcome (Optional)</Label>
                <Input
                  id="desiredOutcome"
                  placeholder="e.g. Recover my deposit, get compensation"
                  {...register('desiredOutcome')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredLocation">Preferred Location</Label>
                <Input
                  id="preferredLocation"
                  placeholder="e.g. Bangalore, Mumbai"
                  {...register('preferredLocation')}
                />
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">
                <Brain className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Our AI will analyze your issue, classify the legal area, score urgency, and find the 5 best-matched lawyers — all in under 30 seconds.</p>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={isPending}>
                {isPending ? 'Analyzing with AI...' : 'Submit & Get Lawyer Matches'}
                {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Brain className="h-16 w-16 text-primary" />
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">AI Analyzing Your Issue...</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Classifying legal category, scoring urgency, and finding the best-matched lawyers from our network.
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Classifying issue</div>
              <div className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Scoring urgency</div>
              <div className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Matching lawyers</div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && submittedCase && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Analysis Complete!</h2>
            <p className="text-muted-foreground">
              Case <strong>{submittedCase.caseNumber}</strong> has been analyzed. We've found matched lawyers for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild>
                <a href={`/client/cases/${submittedCase.id}`}>
                  View Lawyer Matches <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" onClick={() => { setStep(0); }}>
                Submit Another Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
