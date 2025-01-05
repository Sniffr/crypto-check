import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export type Player = 'red' | 'black';

export interface BoardSquare {
  occupant: Player | null;
  isKing: boolean;
}

export interface Board3DProps {
  board: BoardSquare[][];
  currentPlayer: Player;
  selectedPiece: { row: number; col: number } | null;
  onSquareClick: (row: number, col: number) => void;
}

const Board3D: React.FC<Board3DProps> = ({ board, onSquareClick, selectedPiece, currentPlayer }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<any>(null);
  const boardSquaresRef = useRef<THREE.Group>(new THREE.Group());
  const piecesRef = useRef<THREE.Group>(new THREE.Group());

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 8, 8);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    
    // Add orbit controls for better interaction
    const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls');
    controlsRef.current = new OrbitControls(camera, renderer.domElement);
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.05;
    controlsRef.current.minDistance = 5;
    controlsRef.current.maxDistance = 15;
    controlsRef.current.maxPolarAngle = Math.PI / 2;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 0);
    scene.add(directionalLight);

    // Add groups to scene
    scene.add(boardSquaresRef.current);
    scene.add(piecesRef.current);

    // Create board
    createBoard();

    // Animation loop
    const animate = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        if (controlsRef.current) {
          controlsRef.current.update();
        }
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      if (rendererRef.current) {
        const domElement = rendererRef.current.domElement;
        domElement.parentNode?.removeChild(domElement);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, []);

  // Create checkerboard
  const createBoard = () => {
    const boardGroup = boardSquaresRef.current;
    boardGroup.clear();

    const squareGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const lightMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const darkMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = new THREE.Mesh(
          squareGeometry,
          (row + col) % 2 === 0 ? lightMaterial : darkMaterial
        );
        square.position.set(col - 3.5, 0, row - 3.5);
        square.userData = { row, col }; // Store position for raycasting
        boardGroup.add(square);
      }
    }
  };

  // Update pieces based on board state
  useEffect(() => {
    const piecesGroup = piecesRef.current;
    piecesGroup.clear();

    const pieceGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
    const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const blackMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const selectedMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4CAF50,
      metalness: 0.7,
      roughness: 0.3,
      emissive: new THREE.Color(0x2E7D32),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9
    });
    const kingMarkerGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 32);
    const goldMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });

    board.forEach((row, rowIndex) => {
      row.forEach((square, colIndex) => {
        if (square.occupant) {
          const isSelected = selectedPiece && 
            selectedPiece.row === rowIndex && 
            selectedPiece.col === colIndex;

          const piece = new THREE.Mesh(
            pieceGeometry,
            isSelected ? selectedMaterial : (square.occupant === 'red' ? redMaterial : blackMaterial)
          );
          piece.position.set(
            colIndex - 3.5,
            0.15, // Slightly above board
            rowIndex - 3.5
          );
          piecesGroup.add(piece);

          if (square.isKing) {
            const kingMarker = new THREE.Mesh(kingMarkerGeometry, goldMaterial);
            kingMarker.position.set(
              colIndex - 3.5,
              0.35, // Above the piece
              rowIndex - 3.5
            );
            piecesGroup.add(kingMarker);
          }
        }
      });
    });
  }, [board, selectedPiece]);

  // Handle click events
  useEffect(() => {
    if (!mountRef.current || !sceneRef.current || !cameraRef.current) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (cameraRef.current) {
        raycaster.setFromCamera(mouse, cameraRef.current);
        
        // Check for intersections with pieces first
        const pieceIntersects = raycaster.intersectObjects(piecesRef.current.children, true);
        // Then check for intersections with board squares
        const squareIntersects = raycaster.intersectObjects(boardSquaresRef.current.children, true);
        
        // Combine and sort intersections by distance
        const allIntersects = [...pieceIntersects, ...squareIntersects].sort((a, b) => a.distance - b.distance);
        
        if (allIntersects.length > 0) {
          const hitObject = allIntersects[0].object;
          let row, col;
          
          // If we hit a piece or its king marker
          if (pieceIntersects.length > 0 && hitObject === pieceIntersects[0].object) {
            // Get position from the piece's position
            row = Math.floor(hitObject.position.z + 3.5);
            col = Math.floor(hitObject.position.x + 3.5);
          } else {
            // Get position from the square's userData
            const square = hitObject;
            ({ row, col } = square.userData);
          }
          
          console.log('Clicked position:', { row, col });
          console.log('Current board state:', board);
          console.log('Selected piece:', selectedPiece);
          console.log('Hit object type:', pieceIntersects.length > 0 ? 'piece' : 'square');
          
          // Ensure coordinates are within bounds
          if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            onSquareClick(row, col);
          }
        } else {
          console.log('No intersection found. Mouse position:', { x: mouse.x, y: mouse.y });
        }
      }
  };

    mountRef.current.addEventListener('click', onClick);
    return () => {
      mountRef.current?.removeEventListener('click', onClick);
    };
  }, [onSquareClick]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '800px', 
        height: '600px',
        margin: '0 auto'
      }} 
    />
  );
};

export default Board3D;
