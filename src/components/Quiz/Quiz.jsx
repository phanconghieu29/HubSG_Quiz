import React, { useRef, useState, useEffect, useCallback } from "react";
import "../CSS/Quiz.css";
import questionsData from "../../questions/questionsData.json";
import Results from "./Results";
import axios from "axios";

function Quiz() {
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [lock, setLock] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [isFinalQuestion, setIsFinalQuestion] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // Đặt thời gian mặc định (300 giây = 5 phút)
    const question = questionsData[index];

    const optionRefs = useRef([]);

    const handleComplete = useCallback(async () => {
        setQuizCompleted(true);

        try {
            const storedUserInfo =
                JSON.parse(localStorage.getItem("userInfo")) || {};
            const formData = { ...storedUserInfo, score: score };

            // Gửi dữ liệu đến backend
            await axios.post(
                "https://c079h2fp-3000.asse.devtunnels.ms/submit",
                formData
            );
            console.log("Data successfully saved to Google Sheets");
        } catch (error) {
            console.error("Error saving data:", error);
        }
    }, [score]);

    useEffect(() => {
        if (timeLeft > 0 && !quizCompleted) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !quizCompleted) {
            handleComplete(); // Chỉ gọi khi quiz chưa hoàn thành
        }
    }, [timeLeft, quizCompleted, handleComplete]);

    // Chuyển giây thành định dạng phút:giây
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    };

    const handleNext = () => {
        optionRefs.current.forEach((ref) => {
            if (ref) {
                ref.classList.remove("correct", "wrong");
            }
        });

        setLock(false);

        if (index < questionsData.length - 1) {
            setIndex(index + 1);
            if (index + 1 === questionsData.length - 1) {
                setIsFinalQuestion(true);
            }
        }
    };

    const checkAnswer = (e, ans) => {
        if (!lock) {
            const selectedOption = e.target;
            if (ans === question.answer) {
                selectedOption.classList.add("correct");
                setScore(score + question.points);
                setCorrectCount(correctCount + 1);
            } else {
                selectedOption.classList.add("wrong");
                const correctOption = optionRefs.current.find(
                    (ref) => ref.textContent === question.answer
                );
                if (correctOption) {
                    correctOption.classList.add("correct");
                }
            }
            setLock(true);
        }
    };

    const renderOptions = () => {
        return Object.keys(question)
            .filter((key) => key.startsWith("option"))
            .map((optionKey, index) => (
                <li
                    key={optionKey}
                    ref={(el) => (optionRefs.current[index] = el)}
                    onClick={(e) => checkAnswer(e, question[optionKey])}
                >
                    {question[optionKey]}
                </li>
            ));
    };

    if (quizCompleted) {
        return (
            <Results
                score={score}
                correctCount={correctCount}
                totalQuestions={questionsData.length}
            />
        );
    }

    return (
        <div className="container">
            <h1>Chào Mừng Bạn Đã Đến Với Trò Chơi Đố Vui</h1>
            <hr />
            <h2>
                {index + 1}. {question.question}
            </h2>
            <ul>{renderOptions()}</ul>
            <div className="timer">
                <h3>Thời gian còn lại: {formatTime(timeLeft)}</h3>{" "}
                {/* Hiển thị thời gian */}
            </div>
            {isFinalQuestion ? (
                <button onClick={handleComplete}>Hoàn Thành</button>
            ) : (
                <button onClick={handleNext}>Next</button>
            )}
            <div className="index">
                {index + 1} / {questionsData.length} câu hỏi
            </div>
        </div>
    );
}

export default Quiz;
