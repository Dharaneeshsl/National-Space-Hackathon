import numpy as np
from core.conjunction import compute_miss_distance, find_tca, collision_probability

def test_compute_miss_distance():
    traj1 = np.array([[0,0,0], [10,0,0]])
    traj2 = np.array([[0,5,0], [10,5,0]])
    
    dist = compute_miss_distance(traj1, traj2)
    assert np.allclose(dist, [5.0, 5.0])

def test_find_tca():
    times = np.array([0, 10, 20, 30])
    distances = np.array([100.0, 50.0, 10.0, 80.0])
    
    tca, min_dist, idx = find_tca(times, distances, 1.0) # 1 hour window
    assert tca == 20
    assert min_dist == 10.0
    assert idx == 2

def test_collision_probability():
    prob = collision_probability(0.0) # dead center hit
    assert prob > 0
    prob_far = collision_probability(60.0)
    assert prob_far == 0.0
