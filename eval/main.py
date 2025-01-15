import argparse
import pandas as pd
from typing import Callable, Tuple
from grits import grits_from_html

parser = argparse.ArgumentParser(
  prog="Table similarity evaluator",
  description="Evaluates table similarity between two html tables",
  epilog="Hello"
)

parser.add_argument("gt_filename")
parser.add_argument("pred_filename")

def main():
  # read from two command line args: ground truth and predicted
  args = parser.parse_args()

  gt_filename, pred_filename = args.gt_filename, args.pred_filename

  if is_csv(gt_filename) and is_csv(pred_filename):
    gt = pd.read_csv(gt_filename).to_html(index=False)
    pred = pd.read_csv(pred_filename).to_html(index=False)

  else:
    gt, pred = html_files_to_strings(gt_filename, pred_filename)

  # print metrics
  print(grits_from_html(gt, pred))

def is_csv(filename: str) -> bool:
  return filename.split(".")[1] == "csv"


def html_files_to_strings(a: str, b: str) -> Tuple[str, str]:
  """
  Takes in the filename of two html files and returns their html content as string thunks
  """

  with open(a, "r") as f:
    out_a = f.read()

  with open(b, "r") as f:
    out_b = f.read()

  return out_a, out_b



if __name__ == "__main__":
  main()
