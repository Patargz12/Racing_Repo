import { Card } from "@/app/components/ui/card";
import { MessageSquare } from "lucide-react";

const questions = [
  "What are the specifications of the GR Yaris?",
  "Tell me about the latest WRC race results",
  "What's new in the 2024 racing season?",
  "Compare GR Supra vs GR Corolla performance",
  "Upcoming Toyota Gazoo Racing events",
  "History of Toyota in motorsports",
];

interface RecommendedQuestionsProps {
  onQuestionClick?: (question: string) => void;
}

export const RecommendedQuestions = ({
  onQuestionClick,
}: RecommendedQuestionsProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Ask me anything about racing
        </h2>
        <p className="text-muted-foreground">
          Get started with these popular questions
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questions.map((question, index) => (
          <Card
            key={index}
            className="p-4 bg-card border-border hover:border-primary transition-all duration-200"
            onClick={() => onQuestionClick?.(question)}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-foreground">{question}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
