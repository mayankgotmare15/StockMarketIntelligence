---
trigger: model_decision
---

# RESEARCH RULES

## 1. PURPOSE

These rules apply whenever working on:

* Research papers
* Research documentation
* Literature reviews
* Reviewer comments
* Research proposals
* Experimental methodology
* Machine learning experiments
* Results and analysis
* References and citations
* Figures and tables related to research
* Academic documentation

The primary objective is to improve the research work while preserving scientific accuracy and research integrity.

---

## 2. NEVER FABRICATE

Never invent or assume research information.

Never fabricate:

* Experimental results
* Dataset statistics
* Accuracy
* MAE
* RMSE
* R²
* Precision
* Recall
* F1-score
* Training time
* Inference time
* Hardware specifications
* Hyperparameters
* Training epochs
* Batch size
* Learning rate
* Model architecture
* Statistical significance
* p-values
* Confidence intervals
* Cross-validation results
* Ablation results
* Research findings
* Citations
* References
* DOI numbers
* Publication details

If information is unavailable, explicitly mark it:

`[TODO: Verify from source/data/code]`

If an experiment has not been performed:

`[TODO: Additional experiment required]`

NEVER fill missing information using typical/default values.

---

## 3. SOURCE OF TRUTH

When working on an existing research project, prioritize information in this order:

1. Actual experimental data
2. Source code and implementation
3. User-provided research files
4. Approved project/PRD documentation
5. Verified external academic sources
6. General model knowledge

Do not replace actual project information with generic assumptions.

If sources conflict, investigate the conflict before changing anything.

---

## 4. DO NOT CHANGE EXPERIMENTAL RESULTS

Existing experimental results must be treated as protected information.

Do not modify a result merely because:

* It looks unusual.
* Another model normally performs better.
* A reviewer expects a different result.
* The result seems too high or too low.
* A chart does not match the text.
* A textbook example suggests another value.

Instead:

1. Locate the original source.
2. Verify the result.
3. Check whether the value is reproduced elsewhere.
4. Correct it only if evidence confirms the correction.
5. Otherwise mark the inconsistency for verification.

---

## 5. NEVER CLAIM UNPERFORMED EXPERIMENTS

If a reviewer requests:

* XGBoost
* LightGBM
* GRU
* Transformer
* TFT
* Cross-validation
* Statistical testing
* Larger datasets
* Additional stocks
* Additional market periods
* Ablation studies

do not write that the experiment was completed unless actual results exist.

Clearly distinguish:

* Completed experiments
* Experiments currently being performed
* Planned experiments
* Future work

---

## 6. RESEARCH PAPER REVISIONS

When revising a paper according to reviewer comments:

1. Read the relevant manuscript section completely.
2. Understand the reviewer criticism.
3. Determine whether the issue can be fixed through writing or requires new experimentation.
4. Make only evidence-supported changes.
5. Preserve the original scientific meaning.
6. Do not overclaim.
7. Verify consistency across the entire manuscript after editing.

---

## 7. REVIEWER COMMENTS

For every reviewer comment, classify it as:

### A. Writing/Presentation Issue

Examples:

* Grammar
* Formatting
* Figure captions
* Organization
* Clarity
* Academic language

These can normally be fixed directly.

### B. Existing Information Issue

Examples:

* Missing explanation of an already implemented model
* Missing existing hyperparameter
* Missing existing dataset detail
* Missing description of an existing feature

Verify the implementation/source and document the information.

### C. New Experimental Requirement

Examples:

* New ML model
* Larger dataset
* New validation strategy
* Statistical testing
* New baseline
* New market conditions
* Computational benchmark

These require actual work.

Do not fake category C as category A or B.

---

## 8. LITERATURE REVIEW

When working on the literature review:

* Use relevant academic research.
* Prefer peer-reviewed sources.
* Prefer recent high-quality research when appropriate.
* Do not add references just to increase the number of citations.
* Every citation must support the statement it is attached to.
* Do not invent citations.
* Do not invent publication information.
* Do not invent DOI numbers.

For each important paper, understand:

* Problem
* Method
* Dataset/context
* Results
* Limitations
* Relevance to the current research

Do not turn the literature review into a collection of disconnected summaries.

---

## 9. EXTERNAL RESEARCH

When external sources are used:

Clearly distinguish external research from the project's own results.

External papers may be used to:

* Establish background
* Explain related work
* Support methodology
* Establish research gaps
* Compare approaches

External papers must NOT be used to manufacture evidence for the project's own experiments.

---

## 10. NOVELTY CLAIMS

Be conservative when describing novelty.

Do not claim:

* First ever
* World's first
* Completely novel
* State-of-the-art
* Revolutionary
* Unprecedented

unless the claim has been properly established and verified.

Clearly distinguish:

* Algorithmic novelty
* Methodological novelty
* System-level contribution
* Application to a new domain/dataset
* Engineering contribution

If novelty is uncertain, use cautious academic language.

---

## 11. MACHINE LEARNING METHODOLOGY

Only document parameters that are actually known.

Examples:

* Number of layers
* Number of neurons
* Window size
* Sequence length
* Optimizer
* Learning rate
* Batch size
* Epochs
* Dropout
* Number of estimators
* Tree depth
* Feature set
* Scaling method

If the value cannot be verified from code, configuration, experiment logs, or documentation:

`[TODO: Verify from implementation]`

Never use a common/default value as a substitute.

---

## 12. DATASET INTEGRITY

Verify:

* Dataset source
* Dataset size
* Collection period
* Sampling frequency
* Number of samples
* Features
* Target variable
* Train/test split
* Validation strategy

If different sections contain different dataset descriptions, do not silently choose one.

Investigate the source and resolve it only when evidence is available.

Otherwise mark:

`[TODO: Verify dataset description]`

---

## 13. TIME-SERIES RESEARCH

For time-series research, pay particular attention to:

* Chronological ordering
* Future-data leakage
* Train/test separation
* Validation strategy
* Scaling leakage
* Feature leakage
* Target leakage
* Rolling features
* Lag features
* Forecast horizon

Never claim that a methodology prevents data leakage unless the implementation supports that claim.

---

## 14. STATISTICAL CLAIMS

Do not claim statistical significance without an appropriate statistical test.

Do not invent:

* p-values
* Confidence intervals
* Effect sizes
* Statistical significance
* Confidence levels

If statistical validation is requested but unavailable:

`[TODO: Perform statistical validation]`

---

## 15. RESULTS AND DISCUSSION

The discussion must distinguish between:

### Observed result

What the experiment actually produced.

### Interpretation

What the result may indicate.

### Hypothesis

What the researchers expected.

### Limitation

Why the result may not generalize.

Do not present interpretation as fact.

Avoid statements such as:

> "This proves that Model X is superior."

Prefer:

> "Under the evaluated experimental conditions, Model X achieved the lowest error."

---

## 16. FIGURES AND TABLES

Every figure and table must represent real information.

Verify:

* Values
* Labels
* Units
* Axis titles
* Legends
* Captions
* Model names
* Dataset names
* References in text

If a figure and its corresponding text disagree:

DO NOT modify one blindly.

Trace both back to the underlying source.

---

## 17. REFERENCES

Before adding or modifying a reference, verify:

* Author
* Title
* Venue
* Year
* Volume/issue where applicable
* Pages/article number where applicable
* DOI where applicable

Remove duplicate references when confirmed.

Ensure:

* Every important citation has a reference.
* Every listed reference is actually used where appropriate.
* Citation numbering remains consistent after additions/removals.

---

## 18. ACADEMIC LANGUAGE

Use formal academic English.

Correct:

* Grammar
* Sentence structure
* Tense
* Terminology
* Punctuation
* Clarity
* Repetition

Do not change scientific meaning while proofreading.

Avoid informal or exaggerated wording.

---

## 19. DO NOT OVERCLAIM

Avoid unsupported statements involving:

* Investment profitability
* Guaranteed prediction
* Guaranteed accuracy
* Universal model superiority
* Real-world financial success
* Generalization to all markets
* Production readiness

Use evidence-based and appropriately limited language.

---

## 20. LIMITATIONS

Do not hide limitations.

When relevant, explicitly acknowledge:

* Dataset limitations
* Sample-size limitations
* Market limitations
* Model limitations
* Validation limitations
* Data-source limitations
* Computational limitations
* Generalization limitations

A limitation is preferable to an unsupported claim.

---

## 21. REPRODUCIBILITY

When documenting experiments, include reproducibility information when actually available:

* Dataset source
* Dataset period
* Features
* Preprocessing
* Model configuration
* Training procedure
* Validation strategy
* Evaluation metrics
* Software environment
* Hardware environment

Do not invent missing details.

---

## 22. PRESERVE RESEARCH SCOPE

Do not introduce unrelated:

* Models
* Datasets
* Technologies
* Research questions
* Algorithms
* Features

unless they are explicitly requested or required by the approved research plan.

Do not expand the research scope unnecessarily.

---

## 23. SAFE EDITING

Before modifying a research file:

1. Read the relevant section completely.
2. Understand surrounding sections.
3. Check related figures/tables/references.
4. Make the smallest appropriate change.
5. Recheck the surrounding content.
6. Search for the same information elsewhere in the project.
7. Ensure consistency.

Never perform blind global replacements.

---

## 24. CONSISTENCY CHECK

After a major research edit, check:

* Title
* Abstract
* Keywords
* Introduction
* Research gap
* Contributions
* Literature review
* Methodology
* Dataset
* Models
* Experiments
* Results
* Figures
* Tables
* Discussion
* Limitations
* Conclusion
* References

The same fact should not have conflicting versions in different sections.

---

## 25. FINAL RESEARCH INTEGRITY CHECK

Before declaring research work complete, verify:

* [ ] No fabricated information.
* [ ] No fabricated experiments.
* [ ] No fabricated results.
* [ ] No fabricated references.
* [ ] No unsupported statistical claims.
* [ ] No unsupported novelty claims.
* [ ] Methodology matches implementation.
* [ ] Results match actual experiments.
* [ ] Figures match results.
* [ ] Tables match results.
* [ ] Dataset descriptions are consistent.
* [ ] References are consistent.
* [ ] Limitations are acknowledged.
* [ ] Planned work is not described as completed.
* [ ] Future work is not described as implemented.

---

# 26. ABSOLUTE RULE

When choosing between:

**Making the research appear complete**

and

**Maintaining scientific accuracy**

ALWAYS choose scientific accuracy.

A clearly marked missing experiment is acceptable.

A fabricated experiment, result, citation, parameter, dataset statistic, or claim is NEVER acceptable.
