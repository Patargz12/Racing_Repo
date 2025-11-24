import { Card } from "@/app/components/ui/card";
import { MessageSquare } from "lucide-react";

const questions = [
  "What was the position of car number 55 in GR Cup Race 1?",
  "Show me the best lap times from Road America Race 1",
  "What were the weather conditions during Race 1?",
  "Compare sector times for the top 3 drivers",
  "Who had the fastest lap in the Am class?",
  "In GR Cup Race 1, tell me the position of number 58.",
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
          Ask me about GR Cup race data
        </h2>
        <p className="text-muted-foreground">
          Get insights from Road America Race 01 results and telemetry
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
