import numpy as np
from core.propagator import propagate_rk4, _j2_acceleration, MU

def test_j2_acceleration_shape():
    pos = np.array([[7000.0, 0.0, 0.0], [0.0, 7000.0, 0.0]])
    acc = _j2_acceleration(pos)
    assert acc.shape == (2, 3)

def test_propagator_rk4_circular_orbit():
    # Simple circular orbit, altitude 1000km => r = 7378km
    r = 7378.137
    v = np.sqrt(MU / r)
    state = np.array([[r, 0.0, 0.0, 0.0, v, 0.0]])
    
    # 1/4 of an orbit approximately
    period = 2 * np.pi * np.sqrt((r**3) / MU)
    dt = 10.0
    steps = int((period / 4) / dt)
    
    traj = propagate_rk4(state, 0, dt, steps)
    
    # Assert energy/radius is somewhat conserved
    final_pos = traj[-1, 0, 0:3]
    final_r = np.linalg.norm(final_pos)
    
    # Tolerance due to dt=10 and J2 effects
    assert abs(final_r - r) < 10.0
