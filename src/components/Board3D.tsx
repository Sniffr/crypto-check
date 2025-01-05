import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

type Player = 'red' | 'black';

interface BoardSquare {
  occupant: Player | null;
  isKing: boolean;
}

interface Board3DProps {
  board: BoardSquare[][];
  currentPlayer: Player;
  handleSquareClick: (row: number, col: number) => void;
}

const Board3D: React.FC<Board3DProps> = ({ board, handleSquareClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
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
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
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
    const kingMarkerGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 32);
    const goldMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });

    board.forEach((row, rowIndex) => {
      row.forEach((square, colIndex) => {
        if (square.occupant) {
          const piece = new THREE.Mesh(
            pieceGeometry,
            square.occupant === 'red' ? redMaterial : blackMaterial
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
  }, [board]);

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
        const intersects = raycaster.intersectObjects(boardSquaresRef.current.children);

      if (intersects.length > 0) {
        const square = intersects[0].object;
        const { row, col } = square.userData;
        handleSquareClick(row, col);
      }
    }
  };

    mountRef.current.addEventListener('click', onClick);
    return () => {
      mountRef.current?.removeEventListener('click', onClick);
    };
  }, [handleSquareClick]);

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
