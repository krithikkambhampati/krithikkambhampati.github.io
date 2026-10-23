const answerPoints = 1000 // max points for an instant correct answer
// ...
func scoreForAnswer(q Question, answer SubmittedAnswer) int {
	if !answer.Correct {
		return 0
	}
	limit := time.Duration(q.TimeLimitSec) * time.Second
	if limit <= 0 {
		return answerPoints
	}
	timeTaken := time.Duration(answer.TimeTakenMs) * time.Millisecond
	fraction := 1.0 - float64(timeTaken)/float64(limit)
	if fraction < 0 {
		fraction = 0
	}
	return int(float64(answerPoints/2) + fraction*float64(answerPoints/2))
}
