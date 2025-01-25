import argparse
import pandas as pd
from typing import Callable, Tuple
from grits import grits_from_html

parser = argparse.ArgumentParser(
  prog="Table similarity evaluator",
  description="Evaluates table similarity between two html tables",
  epilog="Hello"
)

parser.add_argument("gtruth_filename")
parser.add_argument("pred_filename")

def main():
  # read from two command line args: ground truth and predicted
  args = parser.parse_args()

  gtruth_filename, pred_filename = args.gtruth_filename, args.pred_filename
  gtruth, pred = to_html(gtruth_filename), to_html(pred_filename)

  # print metrics
  print(grits_from_html(gtruth, pred))

def to_html(filename: str) -> str:
  """
  Returns a html string when called on the filename again
  """
  extension = filename.split(".")[1]
  readers = {
    "csv": lambda filename: pd.read_csv(filename).to_html(index=False),
    "html": html_files_to_string,
    "xlsx": lambda filename: pd.read_excel(filename).to_html(index=False)
  }

  return readers[extension](filename)

def html_files_to_string(filename: str) -> str:
  """
  Takes in the filename of two html files and returns their html content as string thunks
  """
  with open(filename, "r", encoding="utf-8") as f:
    return f.read()


if __name__ == "__main__":
  main()
