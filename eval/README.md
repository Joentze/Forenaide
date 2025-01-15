## Overview
- Uses GriTS to evaluate similarity between two tables
- `grits.py` contains helper functions defined from the TATR-transformer repo by microsoft
- main.py takes in two html tables, converts into string representation, and prints out their GriTS metrics.
  - $\text{GriTS}_\text{top}$ calculates similarity based on topology which is rowspan and colspan
  - $\text{GriTS}_\text{con}$ calculates similarity based on the layout of cells and text content of the cells
