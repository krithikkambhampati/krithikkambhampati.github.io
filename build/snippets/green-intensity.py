def _intensity_sub_score(intensity_kwh_m2: float | None) -> float | None:
    if intensity_kwh_m2 is None:
        return None
    b = get_config().intensity_bounds
    frac = (b.i_worst - intensity_kwh_m2) / (b.i_worst - b.i_best)
    return 100 * min(max(frac, 0.0), 1.0)
