import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Flashcard {
  question: string;
  answer: string;
}

@Component({
  imports: [CommonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  flashcards: Flashcard[] = [
    {
      question: "What's the difference between supervised and unsupervised learning?",
      answer: "Supervised learning is like teaching with answer keys - you show the model examples with correct answers (labeled data) until it learns the pattern. Unsupervised learning is pattern discovery without answers - the model finds structure in unlabeled data on its own. Most production ML is supervised; unsupervised is for clustering and anomaly detection."
    },
    {
      question: "Why do we split data into training, validation, and test sets?",
      answer: "You never evaluate a model on the same data you trained it on - that's like letting students grade their own homework with the textbook open. Split data three ways: training (learn patterns), validation (tune hyperparameters), test (final honest assessment). Typical split is 70/15/15 or 80/10/10."
    },
    {
      question: "What's the difference between overfitting and underfitting?",
      answer: "Overfitting is memorization without understanding - your model performs perfectly on training data but fails on new data because it learned noise instead of signal. Underfitting is when your model is too simple to capture the actual patterns. The sweet spot is generalization - performing well on unseen data."
    },
    {
      question: "Explain the bias-variance tradeoff.",
      answer: "Bias is systematic error from wrong assumptions (underfitting). Variance is sensitivity to small fluctuations in training data (overfitting). High bias = too simple, high variance = too complex. You're always balancing these - reduce one, increase the other."
    },
    {
      question: "How do neural networks and deep learning work?",
      answer: "Inspired by biological neurons but vastly simplified. Input layer receives data, hidden layers transform it through weighted connections, output layer makes predictions. 'Deep' just means many hidden layers. Each connection has a weight that's adjusted during training."
    },
    {
      question: "What are transformers and how do attention mechanisms work?",
      answer: "Revolutionary architecture that powers GPT, BERT, and modern LLMs. Unlike older models that process sequentially, transformers use 'attention' to weigh the importance of different parts of input simultaneously. This is why they're so good at language - they can relate distant words in a sentence."
    },
    {
      question: "What are embeddings and why do they matter?",
      answer: "Converting discrete items (words, users, products) into continuous vector representations where similar items are close together in mathematical space. 'King' - 'man' + 'woman' ≈ 'queen' demonstrates this. Foundation of modern NLP and recommendation systems."
    },
    {
      question: "What is a loss function?",
      answer: "The numerical measure of how wrong your model is. Training = minimizing loss. Classification might use cross-entropy loss, regression uses mean squared error. The loss function defines what 'better' means mathematically."
    },
    {
      question: "How do gradient descent and backpropagation work together?",
      answer: "Gradient descent is walking downhill in the dark - you feel the slope and step in the steepest downward direction. Backpropagation calculates those slopes (gradients) efficiently by working backward through the network. This is how neural networks learn - adjust weights to reduce loss."
    },
    {
      question: "What is learning rate and why does it matter?",
      answer: "How big of steps you take when adjusting weights. Too high = you overshoot the optimal solution and bounce around. Too low = training takes forever and you might get stuck. Often starts high and decreases over time (learning rate scheduling)."
    },
    {
      question: "Explain batch size and epochs.",
      answer: "Batch size is how many training examples you process before updating weights. Larger batches = more stable but slower; smaller = noisier but can escape local minima. An epoch is one complete pass through all training data. Models typically train for many epochs."
    },
    {
      question: "What is regularization and why do we use it?",
      answer: "Techniques to prevent overfitting by adding constraints. Dropout randomly ignores neurons during training, forcing the network to learn redundant representations. L1/L2 regularization penalizes large weights. Early stopping halts training before overfitting kicks in."
    },
    {
      question: "What is feature engineering?",
      answer: "Transforming raw data into representations that make patterns obvious to models. Converting timestamps to 'day of week,' normalizing numerical values, encoding categorical variables. Often more impactful than model architecture choice. 'Garbage in, garbage out.'"
    },
    {
      question: "What is hyperparameter tuning and how do you approach it?",
      answer: "Configuration choices you make before training (not learned from data): learning rate, layer sizes, regularization strength. Grid search tries all combinations; random search samples randomly; Bayesian optimization is smarter exploration. Can make or break model performance."
    },
    {
      question: "How does cross-validation work?",
      answer: "Instead of one train/test split, divide data into K folds and train K times, each time using a different fold for testing. Gives more robust performance estimates, especially with limited data. K=5 or K=10 is standard."
    },
    {
      question: "Explain precision, recall, and F1 score.",
      answer: "For classification: Precision = 'of predicted positives, how many were correct?' Recall = 'of actual positives, how many did we find?' F1 = harmonic mean of both. Accuracy alone is misleading with imbalanced classes (99% accuracy is trivial if 99% of data is one class)."
    },
    {
      question: "What is transfer learning and fine-tuning?",
      answer: "Don't train from scratch - start with a model pre-trained on massive datasets, then adapt it to your specific task with smaller data. Like hiring an experienced engineer vs. training from college. Enables powerful models with limited domain-specific data."
    },
    {
      question: "What is prompt engineering?",
      answer: "Crafting inputs to LLMs to get desired outputs. Includes few-shot learning (providing examples in the prompt), chain-of-thought (asking model to reason step-by-step), and system prompts. Currently more art than science but increasingly formalized."
    },
    {
      question: "What is RAG (Retrieval-Augmented Generation)?",
      answer: "Combining LLMs with information retrieval. When answering a question, first search a knowledge base for relevant context, then feed that to the LLM. Reduces hallucinations, enables up-to-date information, and grounds responses in verifiable sources."
    },
    {
      question: "What are hallucination and alignment in AI?",
      answer: "Hallucination = confidently generating false information. Alignment = ensuring models behave according to human values/intentions. Major active research areas. RLHF (Reinforcement Learning from Human Feedback) is key alignment technique - humans rate outputs, model learns preferences."
    }
  ];

  currentIndex = 0;
  isFlipped = false;
  showCompletion = false;
  phase = 'Memorization';
  status = 'Learning';

  get currentCard(): Flashcard {
    return this.flashcards[this.currentIndex];
  }

  get progress(): number {
    return ((this.currentIndex + 1) / this.flashcards.length) * 100;
  }

  ngOnInit(): void {
    this.createParticles();
  }

  createParticles(): void {
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
      document.body.appendChild(particle);
    }
  }

  flipCard(): void {
    this.isFlipped = !this.isFlipped;
  }

  nextCard(): void {
    if (this.currentIndex < this.flashcards.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
    } else {
      this.showCompletion = true;
      this.status = 'Mastered';
    }
  }

  previousCard(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
    }
  }

  resetDeck(): void {
    this.currentIndex = 0;
    this.showCompletion = false;
    this.status = 'Learning';
    this.isFlipped = false;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Only handle keyboard events if not typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    if (event.key === 'ArrowLeft') {
      this.previousCard();
    } else if (event.key === 'ArrowRight') {
      this.nextCard();
    } else if (event.key === ' ') {
      event.preventDefault();
      this.flipCard();
    }
  }
}
