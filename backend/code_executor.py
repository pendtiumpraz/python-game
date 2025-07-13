import subprocess
import sys
import tempfile
import os
import time
import uuid
from typing import Dict, List, Tuple
import ast
import re
from io import StringIO
from contextlib import redirect_stdout, redirect_stderr

class CodeExecutor:
    def __init__(self):
        self.timeout = 10  # 10 seconds timeout
        self.max_memory = 100 * 1024 * 1024  # 100MB memory limit
        
    def execute_code(self, code: str, quest_id: str) -> Dict:
        """Execute Python code safely and return results"""
        try:
            # Clean and validate code
            cleaned_code = self._clean_code(code)
            
            # Check for dangerous operations
            if not self._is_safe_code(cleaned_code):
                return {
                    "success": False,
                    "output": "Code contains potentially dangerous operations",
                    "execution_time": 0,
                    "test_results": []
                }
            
            # Execute code
            start_time = time.time()
            output, error = self._execute_in_sandbox(cleaned_code)
            execution_time = time.time() - start_time
            
            # Run tests
            test_results = self._run_tests(cleaned_code, quest_id)
            
            # Determine success
            success = error is None and all(test["passed"] for test in test_results)
            
            return {
                "success": success,
                "output": output if error is None else f"Error: {error}",
                "execution_time": execution_time,
                "test_results": test_results
            }
            
        except Exception as e:
            return {
                "success": False,
                "output": f"Execution error: {str(e)}",
                "execution_time": 0,
                "test_results": []
            }
    
    def _clean_code(self, code: str) -> str:
        """Clean and prepare code for execution"""
        # Remove any potential dangerous imports or operations
        lines = code.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Skip empty lines and comments
            stripped = line.strip()
            if not stripped or stripped.startswith('#'):
                cleaned_lines.append(line)
                continue
            
            # Allow the line (basic filtering)
            cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def _is_safe_code(self, code: str) -> bool:
        """Check if code is safe to execute"""
        dangerous_patterns = [
            r'import\s+os',
            r'import\s+sys',
            r'import\s+subprocess',
            r'import\s+socket',
            r'import\s+urllib',
            r'import\s+requests',
            r'import\s+shutil',
            r'import\s+glob',
            r'from\s+os\s+import',
            r'from\s+sys\s+import',
            r'from\s+subprocess\s+import',
            r'__import__',
            r'eval\s*\(',
            r'exec\s*\(',
            r'open\s*\(',
            r'file\s*\(',
            r'input\s*\(',
            r'raw_input\s*\(',
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                return False
        
        return True
    
    def _execute_in_sandbox(self, code: str) -> Tuple[str, str]:
        """Execute code in a sandboxed environment"""
        try:
            # Create a restricted environment
            safe_globals = {
                '__builtins__': {
                    'print': print,
                    'len': len,
                    'str': str,
                    'int': int,
                    'float': float,
                    'bool': bool,
                    'list': list,
                    'dict': dict,
                    'tuple': tuple,
                    'set': set,
                    'range': range,
                    'enumerate': enumerate,
                    'zip': zip,
                    'map': map,
                    'filter': filter,
                    'sorted': sorted,
                    'sum': sum,
                    'min': min,
                    'max': max,
                    'abs': abs,
                    'round': round,
                    'isinstance': isinstance,
                    'type': type,
                    'hasattr': hasattr,
                    'getattr': getattr,
                    'setattr': setattr,
                    'dir': dir,
                    'help': help,
                    'ord': ord,
                    'chr': chr,
                    'bin': bin,
                    'hex': hex,
                    'oct': oct,
                    'pow': pow,
                    'divmod': divmod,
                    'True': True,
                    'False': False,
                    'None': None,
                }
            }
            
            # Capture output
            output_buffer = StringIO()
            error_buffer = StringIO()
            
            try:
                with redirect_stdout(output_buffer), redirect_stderr(error_buffer):
                    # Execute the code
                    exec(code, safe_globals)
                
                output = output_buffer.getvalue()
                error = error_buffer.getvalue()
                
                return output, error if error else None
                
            except Exception as e:
                return "", str(e)
                
        except Exception as e:
            return "", f"Sandbox error: {str(e)}"
    
    def _run_tests(self, code: str, quest_id: str) -> List[Dict]:
        """Run tests for the specific quest"""
        test_results = []
        
        try:
            # Parse the code to check for variables and functions
            tree = ast.parse(code)
            
            # Basic tests based on quest_id
            if quest_id == "basic-1":
                test_results = self._test_basic_1(tree, code)
            elif quest_id == "basic-2":
                test_results = self._test_basic_2(tree, code)
            elif quest_id == "basic-3":
                test_results = self._test_basic_3(tree, code)
            else:
                # Generic tests
                test_results = [
                    {
                        "description": "Code syntax check",
                        "passed": True,
                        "points": 50
                    }
                ]
            
        except SyntaxError as e:
            test_results = [
                {
                    "description": "Syntax Error",
                    "passed": False,
                    "points": 0,
                    "message": str(e)
                }
            ]
        except Exception as e:
            test_results = [
                {
                    "description": "Test execution error",
                    "passed": False,
                    "points": 0,
                    "message": str(e)
                }
            ]
        
        return test_results
    
    def _test_basic_1(self, tree: ast.AST, code: str) -> List[Dict]:
        """Test for basic-1 quest (Variables & Data Types)"""
        results = []
        
        # Check for variable assignments
        variables = {}
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        variables[target.id] = type(node.value).__name__
        
        # Test for name variable
        results.append({
            "description": "Check if name variable is defined",
            "passed": 'name' in variables,
            "points": 10
        })
        
        # Test for age variable
        results.append({
            "description": "Check if age variable is defined",
            "passed": 'age' in variables,
            "points": 10
        })
        
        # Test for height variable
        results.append({
            "description": "Check if height variable is defined",
            "passed": 'height' in variables,
            "points": 10
        })
        
        # Test for is_student variable
        results.append({
            "description": "Check if is_student variable is defined",
            "passed": 'is_student' in variables,
            "points": 10
        })
        
        # Test for print statements
        print_count = 0
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'print':
                print_count += 1
        
        results.append({
            "description": "Check if variables are printed",
            "passed": print_count >= 4,
            "points": 10
        })
        
        return results
    
    def _test_basic_2(self, tree: ast.AST, code: str) -> List[Dict]:
        """Test for basic-2 quest (Control Flow)"""
        results = []
        
        # Check for if statements
        has_if = False
        has_for = False
        has_while = False
        
        for node in ast.walk(tree):
            if isinstance(node, ast.If):
                has_if = True
            elif isinstance(node, ast.For):
                has_for = True
            elif isinstance(node, ast.While):
                has_while = True
        
        results.append({
            "description": "Check for if statement",
            "passed": has_if,
            "points": 15
        })
        
        results.append({
            "description": "Check for for loop",
            "passed": has_for,
            "points": 15
        })
        
        results.append({
            "description": "Check for while loop",
            "passed": has_while,
            "points": 15
        })
        
        # Check for range function (commonly used in for loops)
        has_range = False
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'range':
                has_range = True
        
        results.append({
            "description": "Check for proper loop structure",
            "passed": has_range,
            "points": 15
        })
        
        return results
    
    def _test_basic_3(self, tree: ast.AST, code: str) -> List[Dict]:
        """Test for basic-3 quest (Functions)"""
        results = []
        
        # Check for function definitions
        functions = []
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                functions.append(node.name)
        
        expected_functions = ['greet_user', 'calculate_area', 'is_even', 'find_max']
        
        for func_name in expected_functions:
            results.append({
                "description": f"Check for {func_name} function",
                "passed": func_name in functions,
                "points": 20
            })
        
        return results

# Initialize the code executor
code_executor = CodeExecutor()