"use client";

import { QuizMember } from "@repo/utils/validators/quiz";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function QuizChart({ quizMembers }: { quizMembers: QuizMember[] }) {
 const chartData = quizMembers
  .slice()
  .sort((a, b) => b.score - a.score)
  .slice(0, 5)
  .map((member) => ({
   name: member.username,
   score: member.score,
   fill: member.color,
  }));

 const chartConfig = chartData.reduce(
  (acc, item) => ({
   ...acc,
   [item.name]: {
    label: item.name,
    color: item.fill,
   },
  }),
  {
   score: {
    label: "Score",
   },
  }
 ) satisfies ChartConfig;

 if (chartData.length === 0) return <p>No answers yet</p>;

 return (
  <Card className="mx-auto w-full py-3">
   <CardContent className="px-3">
    <ChartContainer config={chartConfig} className="mx-auto w-full" style={{ height: `${chartData.length * 48}px` }}>
     <BarChart accessibilityLayer data={chartData} layout="vertical" barSize={48}>
      <CartesianGrid horizontal={false} syncWithTicks={true} />
      <YAxis dataKey="name" type="category" tickMargin={10} hide />
      <XAxis dataKey="score" type="number" hide />
      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
      <Bar dataKey="score" layout="vertical" radius={8} minPointSize={5}>
       <LabelList dataKey="name" position="insideLeft" offset={16} className="fill-foreground" fontSize={18} />
       <LabelList dataKey="score" position="insideRight" offset={16} className="fill-foreground" fontSize={18} formatter={(value: number) => value.toFixed(0)} />
      </Bar>
     </BarChart>
    </ChartContainer>
   </CardContent>
  </Card>
 );
}
