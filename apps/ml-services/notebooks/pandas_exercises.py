import marimo

__generated_with = "0.18.4"
app = marimo.App(width="medium", css_file="notebook.css")


@app.cell
def _():
    import marimo as mo
    return (mo,)


@app.cell
def _(mo):
    mo.md("""
    # 🐼 Pandas Learning Exercises

    Welcome to the Pandas Learning Exercises! This interactive notebook will guide you through
    the fundamentals of data manipulation with Pandas, Python's powerful data analysis library.

    ## What You'll Learn

    Through 5 progressive exercises, you'll master:
    - **Loading and inspecting data** from CSV files
    - **Filtering and selecting** data using boolean indexing
    - **Transforming data** by creating new columns and applying functions
    - **Grouping and aggregating** data to extract insights
    - **Merging datasets** to combine information from multiple sources

    ## How to Use This Notebook

    1. Read each exercise's instructions carefully
    2. Complete the TODO sections in the code cells
    3. Run the validation cell to check your work
    4. Look for the ✅ checkmark when you've completed an exercise correctly

    **Ready to begin?** Scroll down to Exercise 1 and start coding!
    """)
    return


@app.cell
def _():
    import pandas as pd
    import numpy as np
    from pathlib import Path
    import json
    from typing import Dict, Any

    # Set up data paths
    DATA_DIR = Path(__file__).parent.parent / "data" / "pandas_exercises"
    return DATA_DIR, json, pd


@app.cell
def _(DATA_DIR, pd):
    # Load sample datasets
    students_df = pd.read_csv(DATA_DIR / "students.csv")
    courses_df = pd.read_csv(DATA_DIR / "courses.csv")
    enrollments_df = pd.read_csv(DATA_DIR / "enrollments.csv")
    return courses_df, enrollments_df, students_df


@app.cell
def _():
    exercise_results = {
        "exercise_1": {"completed": False, "errors": []},
        "exercise_2": {"completed": False, "errors": []},
        "exercise_3": {"completed": False, "errors": []},
        "exercise_4": {"completed": False, "errors": []},
        "exercise_5": {"completed": False, "errors": []},
    }
    return (exercise_results,)


@app.cell
def _(mo):
    mo.md("""
    ---

    ## 📊 Exercise 1: Loading and Inspecting Data

    **Objective**: Learn how to load CSV files and inspect their contents.

    **Tasks**:
    1. Load the students.csv file into a DataFrame called `df1`
    2. Display the first 5 rows using `head()`
    3. Get basic info about the DataFrame using `info()`
    4. Get statistical summary using `describe()`

    **Starter Code**:
    ```python
    # TODO: Load students.csv
    df1 = None

    # TODO: Display first 5 rows
    # df1.head()

    # TODO: Get DataFrame info
    # df1.info()

    # TODO: Get statistical summary
    # df1.describe()
    ```
    """)
    return


@app.cell
def _(DATA_DIR, pd):
    # TODO: Load students.csv
    df1 = pd.read_csv(DATA_DIR / "students.csv")

    # TODO: Display first 5 rows
    df1.head()
    return (df1,)


@app.cell
def _(df1):
    # TODO: Get DataFrame info
    df1.info()
    return


@app.cell
def _(df1):
    # TODO: Get statistical summary
    df1.describe()
    return


@app.cell
def _(df1, exercise_results):
    # Validation for Exercise 1
    def validate_exercise_1():
        errors = []
        try:
            # Check if df1 exists and is a DataFrame
            if 'df1' not in globals():
                errors.append("df1 is not defined")
                return False, errors

            # Check if df1 is loaded correctly
            expected_columns = ['student_id', 'name', 'age', 'email', 'major', 'gpa', 'enrollment_year']
            if not all(col in df1.columns for col in expected_columns):
                errors.append(f"Missing columns. Expected: {expected_columns}, Got: {list(df1.columns)}")

            # Check if df1 has data
            if len(df1) == 0:
                errors.append("df1 is empty")

            # Check if df1 has correct number of rows (should be 10)
            if len(df1) != 10:
                errors.append(f"Expected 10 rows, got {len(df1)}")

            if errors:
                return False, errors
            return True, []
        except Exception as e:
            return False, [str(e)]

    is_valid, errors = validate_exercise_1()
    exercise_results["exercise_1"]["completed"] = is_valid
    exercise_results["exercise_1"]["errors"] = errors

    if is_valid:
        print("✅ Exercise 1: PASSED!")
    else:
        print(f"❌ Exercise 1: FAILED")
        for error in errors:
            print(f"   - {error}")
    return


@app.cell
def _(mo):
    mo.md("""
    ---

    ## 🔍 Exercise 2: Basic Filtering and Selection

    **Objective**: Learn boolean indexing and data selection.

    **Tasks**:
    1. Filter students with GPA >= 3.7 into `high_gpa_students`
    2. Select only 'name' and 'gpa' columns for students in Computer Science major
    3. Use `iloc` to select rows 0, 2, 4 (first, third, fifth student)

    **Starter Code**:
    ```python
    # TODO: Filter students with GPA >= 3.7
    high_gpa_students = None

    # TODO: Select name and gpa for CS students
    cs_students_info = None

    # TODO: Use iloc to select rows 0, 2, 4
    selected_rows = None
    ```
    """)
    return


@app.cell
def _(df1):
    # TODO: Filter students with GPA >= 3.7
    high_gpa_students = df1[df1['gpa'] >= 3.7]
    high_gpa_students
    return (high_gpa_students,)


@app.cell
def _(df1):
    # TODO: Select name and gpa for CS students
    cs_students_info = df1[df1['major'] == 'Computer Science'][['name', 'gpa']]
    cs_students_info
    return (cs_students_info,)


@app.cell
def _(df1):
    # TODO: Use iloc to select rows 0, 2, 4
    selected_rows = df1.iloc[[0, 2, 4]]
    selected_rows
    return (selected_rows,)


@app.cell
def _(
    cs_students_info,
    df1,
    exercise_results,
    high_gpa_students,
    selected_rows,
):
    # Validation for Exercise 2
    def validate_exercise_2():
        errors = []
        try:
            # Check high_gpa_students
            if 'high_gpa_students' not in globals():
                errors.append("high_gpa_students is not defined")
            elif len(high_gpa_students) == 0:
                errors.append("high_gpa_students is empty")
            elif not all(high_gpa_students['gpa'] >= 3.7):
                errors.append("high_gpa_students contains students with GPA < 3.7")

            # Check cs_students_info
            if 'cs_students_info' not in globals():
                errors.append("cs_students_info is not defined")
            elif set(cs_students_info.columns) != {'name', 'gpa'}:
                errors.append(f"cs_students_info should have columns ['name', 'gpa'], got {list(cs_students_info.columns)}")
            elif not all(cs_students_info.index.isin(df1[df1['major'] == 'Computer Science'].index)):
                errors.append("cs_students_info contains non-CS students")

            # Check selected_rows
            if 'selected_rows' not in globals():
                errors.append("selected_rows is not defined")
            elif len(selected_rows) != 3:
                errors.append(f"selected_rows should have 3 rows, got {len(selected_rows)}")

            if errors:
                return False, errors
            return True, []
        except Exception as e:
            return False, [str(e)]

    is_valid, errors = validate_exercise_2()
    exercise_results["exercise_2"]["completed"] = is_valid
    exercise_results["exercise_2"]["errors"] = errors

    if is_valid:
        print("✅ Exercise 2: PASSED!")
    else:
        print(f"❌ Exercise 2: FAILED")
        for error in errors:
            print(f"   - {error}")
    return


@app.cell
def _(mo):
    mo.md("""
    ---

    ## 🔄 Exercise 3: Data Transformation

    **Objective**: Learn to create new columns and transform data.

    **Tasks**:
    1. Add a new column 'gpa_category' that categorizes GPA as 'High' (>=3.7), 'Medium' (3.0-3.6), 'Low' (<3.0)
    2. Create a column 'years_enrolled' = current_year - enrollment_year (use 2024 as current_year)
    3. Use `apply()` to create a column 'email_domain' extracting the domain from email

    **Starter Code**:
    ```python
    # TODO: Add gpa_category column
    # df1['gpa_category'] = ...

    # TODO: Add years_enrolled column
    # df1['years_enrolled'] = ...

    # TODO: Add email_domain column using apply
    # df1['email_domain'] = df1['email'].apply(...)
    ```
    """)
    return


@app.cell
def _(df1):
    # TODO: Add gpa_category column
    df1['gpa_category'] = df1['gpa'].apply(
        lambda x: 'High' if x >= 3.7 else ('Medium' if x >= 3.0 else 'Low')
    )
    df1[['name', 'gpa', 'gpa_category']]
    return


@app.cell
def _(df1):
    # TODO: Add years_enrolled column
    current_year = 2024
    df1['years_enrolled'] = current_year - df1['enrollment_year']
    df1[['name', 'enrollment_year', 'years_enrolled']]
    return


@app.cell
def _(df1):
    # TODO: Add email_domain column using apply
    df1['email_domain'] = df1['email'].apply(lambda x: x.split('@')[1])
    df1[['name', 'email', 'email_domain']]
    return


@app.cell
def _(df1, exercise_results):
    # Validation for Exercise 3
    def validate_exercise_3():
        errors = []
        try:
            # Check gpa_category
            if 'gpa_category' not in df1.columns:
                errors.append("gpa_category column is missing")
            else:
                valid_categories = {'High', 'Medium', 'Low'}
                if not all(cat in valid_categories for cat in df1['gpa_category'].unique()):
                    errors.append(f"gpa_category contains invalid values. Expected: {valid_categories}")

            # Check years_enrolled
            if 'years_enrolled' not in df1.columns:
                errors.append("years_enrolled column is missing")
            else:
                expected_years = 2024 - df1['enrollment_year']
                if not (df1['years_enrolled'] == expected_years).all():
                    errors.append("years_enrolled calculation is incorrect")

            # Check email_domain
            if 'email_domain' not in df1.columns:
                errors.append("email_domain column is missing")
            else:
                # All should be 'university.edu'
                if not all(df1['email_domain'] == 'university.edu'):
                    errors.append("email_domain extraction is incorrect")

            if errors:
                return False, errors
            return True, []
        except Exception as e:
            return False, [str(e)]

    is_valid, errors = validate_exercise_3()
    exercise_results["exercise_3"]["completed"] = is_valid
    exercise_results["exercise_3"]["errors"] = errors

    if is_valid:
        print("✅ Exercise 3: PASSED!")
    else:
        print(f"❌ Exercise 3: FAILED")
        for error in errors:
            print(f"   - {error}")
    return


@app.cell
def _(mo):
    mo.md("""
    ---

    ## 📈 Exercise 4: Grouping and Aggregation

    **Objective**: Learn groupby operations and aggregations.

    **Tasks**:
    1. Group students by 'major' and calculate average GPA for each major
    2. Group enrollments by 'course_id' and count the number of students per course
    3. Create a pivot table showing average GPA by major and enrollment_year

    **Starter Code**:
    ```python
    # TODO: Average GPA by major
    # avg_gpa_by_major = ...

    # TODO: Count students per course
    # students_per_course = ...

    # TODO: Pivot table: average GPA by major and enrollment_year
    # gpa_pivot = ...
    ```
    """)
    return


@app.cell
def _(df1):
    # TODO: Average GPA by major
    avg_gpa_by_major = df1.groupby('major')['gpa'].mean()
    avg_gpa_by_major
    return (avg_gpa_by_major,)


@app.cell
def _(enrollments_df):
    # TODO: Count students per course
    students_per_course = enrollments_df.groupby('course_id').size()
    students_per_course
    return (students_per_course,)


@app.cell
def _(df1):
    # TODO: Pivot table: average GPA by major and enrollment_year
    gpa_pivot = df1.pivot_table(values='gpa', index='major', columns='enrollment_year', aggfunc='mean')
    gpa_pivot
    return (gpa_pivot,)


@app.cell
def _(avg_gpa_by_major, df1, exercise_results, gpa_pivot, students_per_course):
    # Validation for Exercise 4
    def validate_exercise_4():
        errors = []
        try:
            # Check avg_gpa_by_major
            if 'avg_gpa_by_major' not in globals():
                errors.append("avg_gpa_by_major is not defined")
            elif len(avg_gpa_by_major) == 0:
                errors.append("avg_gpa_by_major is empty")
            elif not all(major in df1['major'].unique() for major in avg_gpa_by_major.index):
                errors.append("avg_gpa_by_major contains invalid majors")

            # Check students_per_course
            if 'students_per_course' not in globals():
                errors.append("students_per_course is not defined")
            elif len(students_per_course) == 0:
                errors.append("students_per_course is empty")

            # Check gpa_pivot
            if 'gpa_pivot' not in globals():
                errors.append("gpa_pivot is not defined")
            elif 'major' not in gpa_pivot.index.names and 'major' not in gpa_pivot.columns:
                errors.append("gpa_pivot should have 'major' as index")

            if errors:
                return False, errors
            return True, []
        except Exception as e:
            return False, [str(e)]

    is_valid, errors = validate_exercise_4()
    exercise_results["exercise_4"]["completed"] = is_valid
    exercise_results["exercise_4"]["errors"] = errors

    if is_valid:
        print("✅ Exercise 4: PASSED!")
    else:
        print(f"❌ Exercise 4: FAILED")
        for error in errors:
            print(f"   - {error}")
    return


@app.cell
def _(mo):
    mo.md("""
    ---

    ## 🔗 Exercise 5: Merging Datasets

    **Objective**: Learn to combine multiple DataFrames.

    **Tasks**:
    1. Merge students_df and enrollments_df on 'student_id' (inner join)
    2. Merge the result with courses_df on 'course_id' to get full student-course info
    3. Use concat to combine students_df with a new row (append a new student)

    **Starter Code**:
    ```python
    # TODO: Merge students and enrollments
    # student_enrollments = ...

    # TODO: Merge with courses
    # full_info = ...

    # TODO: Concatenate with new student
    # new_student = pd.DataFrame({...})
    # all_students = ...
    ```
    """)
    return


@app.cell
def _(enrollments_df, pd, students_df):
    # TODO: Merge students and enrollments
    student_enrollments = pd.merge(students_df, enrollments_df, on='student_id', how='inner')
    student_enrollments.head()
    return (student_enrollments,)


@app.cell
def _(courses_df, pd, student_enrollments):
    # TODO: Merge with courses
    full_info = pd.merge(student_enrollments, courses_df, on='course_id', how='inner')
    full_info.head()
    return (full_info,)


@app.cell
def _(pd, students_df):
    # TODO: Concatenate with new student
    new_student = pd.DataFrame({
        'student_id': [11],
        'name': ['Kevin Spacey'],
        'age': [23],
        'email': ['kevin.spacey@university.edu'],
        'major': ['Computer Science'],
        'gpa': [3.6],
        'enrollment_year': [2021]
    })
    all_students = pd.concat([students_df, new_student], ignore_index=True)
    all_students.tail()
    return (all_students,)


@app.cell
def _(
    all_students,
    exercise_results,
    full_info,
    student_enrollments,
    students_df,
):
    # Validation for Exercise 5
    def validate_exercise_5():
        errors = []
        try:
            # Check student_enrollments
            if 'student_enrollments' not in globals():
                errors.append("student_enrollments is not defined")
            elif len(student_enrollments) == 0:
                errors.append("student_enrollments is empty")
            elif 'student_id' not in student_enrollments.columns or 'course_id' not in student_enrollments.columns:
                errors.append("student_enrollments missing required columns")

            # Check full_info
            if 'full_info' not in globals():
                errors.append("full_info is not defined")
            elif len(full_info) == 0:
                errors.append("full_info is empty")
            elif 'course_name' not in full_info.columns:
                errors.append("full_info should include course information from courses_df")

            # Check all_students
            if 'all_students' not in globals():
                errors.append("all_students is not defined")
            elif len(all_students) != len(students_df) + 1:
                errors.append(f"all_students should have {len(students_df) + 1} rows, got {len(all_students)}")

            if errors:
                return False, errors
            return True, []
        except Exception as e:
            return False, [str(e)]

    is_valid, errors = validate_exercise_5()
    exercise_results["exercise_5"]["completed"] = is_valid
    exercise_results["exercise_5"]["errors"] = errors

    if is_valid:
        print("✅ Exercise 5: PASSED!")
    else:
        print(f"❌ Exercise 5: FAILED")
        for error in errors:
            print(f"   - {error}")
    return


@app.cell
def _(mo):
    mo.md("""
    ---

    ## 📊 Progress Summary

    Your completion status for all exercises:
    """)
    return


@app.cell
def _(exercise_results):
    # Display progress
    completed_count = sum(1 for ex in exercise_results.values() if ex["completed"])
    total_count = len(exercise_results)

    print(f"Progress: {completed_count}/{total_count} exercises completed")
    print("\nDetailed Status:")
    for ex_name, ex_data in exercise_results.items():
        status = "✅" if ex_data["completed"] else "❌"
        print(f"  {status} {ex_name.replace('_', ' ').title()}")
        if ex_data["errors"]:
            for error in ex_data["errors"]:
                print(f"     - {error}")
    return


@app.cell
def _(exercise_results, json, pd):
    # Generate JSON summary for submission
    def generate_submission_summary():
        """Generate a JSON summary of the notebook state for API submission."""
        completed_exercises = [
            int(ex_name.split("_")[1]) 
            for ex_name, ex_data in exercise_results.items() 
            if ex_data["completed"]
        ]

        summary = {
            "notebookId": "pandas_exercises",
            "completedExercises": completed_exercises,
            "totalExercises": 5,
            "completionRate": len(completed_exercises) / 5,
            "validationResults": exercise_results,
            "timestamp": pd.Timestamp.now().isoformat() if 'pd' in globals() else None
        }

        return json.dumps(summary, indent=2)

    submission_json = generate_submission_summary()
    print("Submission JSON (copy this for API submission):")
    print(submission_json)
    return


if __name__ == "__main__":
    app.run()
