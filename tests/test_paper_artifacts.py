"""
Unit Tests for Phase 9 Academic Artifacts & Paper Outputs.
Validates existence, structure, and integrity of LaTeX tables and figures.
"""

import pytest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
LATEX_DIR = BASE_DIR / "reports" / "latex"
FIGURES_DIR = BASE_DIR / "reports" / "figures"


def test_latex_tables_exist_and_valid():
    """Verify that all publication-ready LaTeX tables exist and contain required tags."""
    t1 = LATEX_DIR / "table1_main_results.tex"
    t2 = LATEX_DIR / "table2_regime_ablation.tex"
    t3 = LATEX_DIR / "table3_sector_breakdown.tex"
    manuscript = LATEX_DIR / "paper_manuscript.tex"

    assert t1.exists(), "Table 1 (Main Results) missing"
    assert t2.exists(), "Table 2 (Regime Ablation) missing"
    assert t3.exists(), "Table 3 (Sector Breakdown) missing"
    assert manuscript.exists(), "Paper Manuscript missing"

    content_t1 = t1.read_text(encoding="utf-8")
    assert "\\begin{table*}" in content_t1
    assert "Regime Adaptive (Ours)" in content_t1 or "Adaptive" in content_t1
    assert "Liu et al." in content_t1

    content_t2 = t2.read_text(encoding="utf-8")
    assert "\\begin{table}" in content_t2
    assert "Low Volatility" in content_t2
    assert "High Volatility" in content_t2

    content_manuscript = manuscript.read_text(encoding="utf-8")
    assert "\\title{Dynamic Stacking Meta-Models with Concept Drift Detection" in content_manuscript
    assert "input{table1_main_results.tex}" in content_manuscript


def test_figures_exist_and_non_empty():
    """Verify that all 300 DPI high-resolution figures exist and have valid file size."""
    f1 = FIGURES_DIR / "figure1_walk_forward_forecast.png"
    f2 = FIGURES_DIR / "figure2_regime_error_comparison.png"
    f3 = FIGURES_DIR / "figure3_tree_shap_importance.png"
    f4 = FIGURES_DIR / "figure4_drift_dynamics.png"

    for f in [f1, f2, f3, f4]:
        assert f.exists(), f"Figure {f.name} missing"
        assert f.stat().st_size > 10000, f"Figure {f.name} is too small ({f.stat().st_size} bytes)"
