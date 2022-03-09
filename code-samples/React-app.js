import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Tasks from './components/Tasks';
import AddTask from './components/AddTask';
import About from './components/About';
import './index.css';

const App = () => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const getTask = async () => {
      const tasksFromServer = await fetchTasks();
      setTasks(tasksFromServer);
    };
    getTask();
  }, []);

  //Fetch tasks
  const fetchTasks = async () => {
    const res = await fetch('http://localhost:5000/tasks');
    const data = await res.json();

    return data;
  };

  //Fetch task
  const fetchTask = async (id) => {
    let res = await fetch(`http://localhost:5000/tasks/${id}`);
    const data = await res.json();

    return data;
  };

  //Add task
  const addTask = async (task) => {
    const id = Math.floor(Math.random() * 10000) + 1;
    const newTask = { id, ...task };

    const res = await fetch('http://localhost:5000/tasks', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(newTask)
    });
    const data = await res.json();

    setTasks([...tasks, data]);
  };

  //Delete task
  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter((task) => task.id !== id));
  };

  //Toggle reminder
  const ToggleReminder = async (id) => {
    const taskToToggle = await fetchTask(id);
    const updateTask = {
      ...taskToToggle,
      reminder: !taskToToggle.reminder
    };

    const res = await fetch(`http://localhost:5000/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(updateTask)
    });

    const data = await res.json();

    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, reminder: data.reminder } : task
      )
    );
  };
  return (
    <Router>
      <div className="container">
        <Header
          title="Task tracker"
          onAdd={() => setShowAddTask(!showAddTask)}
          showAdd={showAddTask}
        />

        <Routes>
          <Route
            path="/"
            element={
              <>
                {showAddTask && <AddTask onAdd={addTask}></AddTask>}
                {tasks.length > 0 ? (
                  <Tasks
                    tasks={tasks}
                    onDelete={deleteTask}
                    onToggle={ToggleReminder}
                  ></Tasks>
                ) : (
                  'No task to show'
                )}
              </>
            }
          ></Route>
          <Route path="/about" element={<About />} />
        </Routes>
        <Footer></Footer>
      </div>
    </Router>
  );
};

export default App;
