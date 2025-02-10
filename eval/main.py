import argparse
import os
import pandas as pd
from typing import Callable, Tuple, List, Dict
from grits import grits_from_html
from bs4 import BeautifulSoup
from io import StringIO

parser = argparse.ArgumentParser(
    description="Compare ground truth and predicted files in a directory."
)
parser.add_argument(
    "directory",
    type=str,
    help="The directory containing ground truth and predicted CSV files.",
)

def main():
    # read from two command line args: ground truth and predicted
    args = parser.parse_args()

    directory = args.directory
    compare_files(directory)

def compare_files(directory: str) -> None:
    """
    Compares the ground truth and predicted files in the given directory
    """
    file_pairs = get_file_pairs(directory)
    for file, filenames in file_pairs.items():
        if len(filenames) != 2:
            print(f"Skipping {file} as it does not have both ground truth and predicted files.")
            continue
        pretty_print_grits(file, filenames)

def pretty_print_grits(file, filenames) -> None:
        gt_filename, pred_filename = filenames
        gtruth, pred = to_html(gt_filename), to_html(pred_filename)
        grits = grits_from_html(gtruth, pred)
        print(f"Comparing {file}")
        for key, value in grits.items():
            print(f"\t{key}: {value}")

def get_file_pairs(directory: str) -> Dict[str, List[str]]:
    """
    Returns a dictionary of ground truth filenames to their corresponding predicted filenames
    """
    file_pairs = {}
    for filename in os.listdir(directory):
        if "_gt" in filename:
            file = filename.split("_gt")[0]
            file_pairs[file] = file_pairs.get(file, []) + [os.path.join(directory, filename)]
        elif "_pred" in filename:
            file = filename.split("_pred")[0]
            file_pairs[file] = file_pairs.get(file, []) + [os.path.join(directory, filename)]
    return file_pairs

def to_html(filename: str) -> str:
    """
    Returns a html string when called on the filename again
    """
    extension = filename.split(".")[1]
    readers = {
        "csv": lambda filename: pd.read_csv(filename).sort_index(axis=1).to_html(index=False),
        "html": html_files_to_string,
        "xlsx": lambda filename: pd.read_excel(filename).sort_index(axis=1).to_html(index=False)
    }

    return readers[extension](filename)

def html_files_to_string(filename: str) -> str:
    """
    Takes in the filename of two html files and returns their html content as string thunks
    """
    with open(filename, "r", encoding="utf-8") as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, "html.parser")
    table = soup.find("table")    # Assuming you want to sort the first table

    if table:
        # Convert the HTML table to a Pandas DataFrame
        # Wrap the HTML string in a StringIO object
        html_io = StringIO(str(table))
        df = pd.read_html(html_io)[0]    # read_html returns a list

        # Sort the DataFrame by column headers
        df = df.sort_index(axis=1)

        # Convert the sorted DataFrame back to HTML
        sorted_table_html = df.to_html(index=False)

        # Replace the original table with the sorted table in the soup
        new_table = BeautifulSoup(sorted_table_html, "html.parser").find("table")
        table.replace_with(new_table)

        return str(soup)
    else:
        return html_content


if __name__ == "__main__":
    main()
